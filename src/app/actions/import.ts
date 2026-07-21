'use server'

import { getCurrentUser } from './auth'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export type ColumnMapping = {
  service_date?: string
  mileage?: string
  service_type?: string
  description?: string
  cost?: string
  shop_name?: string
  // For modifications
  install_date?: string
  part_name?: string
  brand?: string
  category?: string
  notes?: string
}

export async function analyzeImportMapping(
  headers: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sampleRows: any[][],
  recordType: 'maintenance' | 'modification'
) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not logged in' }
  if (!user.is_pro) return { error: 'Pro subscription required for AI imports.' }

  const apiKey = process.env.PERPLEXITY_API_KEY || process.env.OPENAI_API_KEY

  if (!apiKey) {
    // Best-effort heuristic mapping if no API key is present
    return {
      success: true,
      mapping: heuristicMap(headers, recordType),
      isMock: true
    }
  }

  try {
    const prompt = `
      I have a ${recordType} log file with the following headers: ${headers.join(', ')}.
      Here are the first 3 rows of data:
      ${sampleRows.slice(0, 3).map(row => JSON.stringify(row)).join('\n')}

      Please map these headers to the following internal fields for ${recordType}:
      ${recordType === 'maintenance' 
        ? 'service_date, mileage, service_type, description, cost, shop_name'
        : 'install_date, part_name, brand, category, cost, notes'}

      Return a JSON object where keys are the internal fields and values are the corresponding headers from the file. 
      If a field cannot be found, omit it.
      Only return the JSON object.
    `

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3-sonar-small-32k-chat',
        messages: [
          { role: 'system', content: 'You are a data processing assistant.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const mapping = JSON.parse(data.choices[0].message.content)

    return { success: true, mapping }
  } catch (error) {
    console.error('AI Mapping failed:', error)
    return { 
      success: true, 
      mapping: heuristicMap(headers, recordType),
      isMock: true,
      note: 'AI mapping failed, falling back to heuristic.'
    }
  }
}

function heuristicMap(headers: string[], recordType: 'maintenance' | 'modification') {
  const mapping: Record<string, string> = {}
  
  const search = (candidates: string[]) => {
    return headers.find(h => 
      candidates.some(c => h.toLowerCase().includes(c.toLowerCase()))
    )
  }

  if (recordType === 'maintenance') {
    mapping.service_date = search(['date', 'time', 'day']) || ''
    mapping.mileage = search(['mile', 'odo', 'km', 'dist']) || ''
    mapping.service_type = search(['type', 'service', 'category', 'work']) || ''
    mapping.description = search(['desc', 'note', 'detail', 'comment']) || ''
    mapping.cost = search(['cost', 'price', 'amount', 'total', 'paid']) || ''
    mapping.shop_name = search(['shop', 'mechanic', 'place', 'location', 'vendor']) || ''
  } else {
    mapping.install_date = search(['date', 'install', 'time', 'day']) || ''
    mapping.part_name = search(['part', 'name', 'item', 'mod', 'modification']) || ''
    mapping.brand = search(['brand', 'make', 'mfg', 'manufacturer']) || ''
    mapping.category = search(['cat', 'type', 'group']) || ''
    mapping.cost = search(['cost', 'price', 'amount', 'total', 'paid']) || ''
    mapping.notes = search(['note', 'desc', 'detail', 'comment']) || ''
  }

  // Remove empty mappings
  Object.keys(mapping).forEach(key => {
    if (!mapping[key]) delete mapping[key]
  })

  return mapping
}

export async function executeBatchImport(
  vehicleId: string,
  recordType: 'maintenance' | 'modification',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  mapping: ColumnMapping
) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not logged in' }
  if (!user.is_pro) return { error: 'Pro subscription required for AI imports.' }

  const hasRealKeys = await isSupabaseConfigured()

  const recordsToInsert = data.map(row => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const record: any = {
      vehicle_id: vehicleId,
      created_at: new Date().toISOString()
    }

    if (recordType === 'maintenance') {
      record.service_date = formatDate(row[mapping.service_date!])
      record.mileage = parseInt(row[mapping.mileage!]) || 0
      record.service_type = row[mapping.service_type!] || 'Imported Service'
      record.description = row[mapping.description!] || null
      record.cost = parseFloat(row[mapping.cost!]) || 0
      record.shop_name = row[mapping.shop_name!] || null
    } else {
      record.install_date = formatDate(row[mapping.install_date!])
      record.part_name = row[mapping.part_name!] || 'Imported Part'
      record.brand = row[mapping.brand!] || null
      record.category = row[mapping.category!] || null
      record.cost = parseFloat(row[mapping.cost!]) || 0
      record.notes = row[mapping.notes!] || null
    }

    return record
  }).filter(r => {
    // Basic validation: must have date and name/type
    if (recordType === 'maintenance') {
      return r.service_date && r.service_type
    } else {
      return r.install_date && r.part_name
    }
  })

  if (recordsToInsert.length === 0) {
    return { error: 'No valid records found in the import data.' }
  }

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const table = recordType === 'maintenance' ? 'maintenance_records' : 'modifications'
      
      const { error } = await supabase
        .from(table)
        .insert(recordsToInsert)

      if (error) throw error

      // Update vehicle mileage if maintenance
      if (recordType === 'maintenance') {
        const maxMileage = Math.max(...recordsToInsert.map(r => r.mileage))
        const { data: vehicle } = await supabase
          .from('vehicles')
          .select('current_mileage')
          .eq('id', vehicleId)
          .single()

        if (vehicle && (!vehicle.current_mileage || maxMileage > vehicle.current_mileage)) {
          await supabase
            .from('vehicles')
            .update({ current_mileage: maxMileage })
            .eq('id', vehicleId)
        }
      }

      revalidatePath(`/vehicles/${vehicleId}`)
      return { success: true, count: recordsToInsert.length }
    } catch (e) {
      console.error('Batch import failed:', e)
      return { error: e instanceof Error ? e.message : 'Failed to execute batch import.' }
    }
  }

  // Fallback Mock Persistence
  const cookieStore = await cookies()
  const cookieName = recordType === 'maintenance' ? `garagebook_maintenance` : `garagebook_modifications`
  const maintenanceCookie = cookieStore.get(cookieName)
  
  let existingRecords = []
  if (maintenanceCookie) {
    try {
      existingRecords = JSON.parse(maintenanceCookie.value)
    } catch {
      existingRecords = []
    }
  }

  // Add IDs to mock records
  const newRecords = recordsToInsert.map((r, i) => ({
    ...r,
    id: `import-mock-${Date.now()}-${i}`
  }))

  const updatedRecords = [...newRecords, ...existingRecords]
  cookieStore.set(cookieName, JSON.stringify(updatedRecords), { path: '/' })

  // Update vehicle mileage in mock
  if (recordType === 'maintenance') {
    const maxMileage = Math.max(...recordsToInsert.map(r => r.mileage))
    const vehiclesCookie = cookieStore.get('garagebook_vehicles')
    if (vehiclesCookie) {
      try {
        const list = JSON.parse(vehiclesCookie.value)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updatedList = list.map((v: any) => {
          if (v.id === vehicleId) {
            return {
              ...v,
              current_mileage: Math.max(v.current_mileage || 0, maxMileage)
            }
          }
          return v
        })
        cookieStore.set('garagebook_vehicles', JSON.stringify(updatedList), { path: '/' })
      } catch (e) {
        console.error('Failed to update mock vehicle mileage:', e)
      }
    }
  }

  revalidatePath(`/vehicles/${vehicleId}`)
  return { success: true, count: newRecords.length }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatDate(val: any): string | null {
  if (!val) return null
  const d = new Date(val)
  if (isNaN(d.getTime())) return null
  return d.toISOString().split('T')[0]
}

// Helper to check if real Supabase keys are configured
async function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(url && key && !url.includes('your-supabase') && !key.includes('your-supabase'))
}
