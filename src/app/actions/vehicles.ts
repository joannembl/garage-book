'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { isSupabaseConfigured, getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

export interface VehicleData {
  id: string
  user_id: string
  year: number
  make: string
  model: string
  trim: string | null
  body_style: string | null
  vin: string | null
  purchase_date: string | null
  purchase_price: number | null
  current_mileage: number | null
  is_primary: boolean
  created_at: string
}

// Sample Miata used for empty states / demo purposes
const SAMPLE_MIATA: VehicleData = {
  id: 'demo-miata-1994',
  user_id: '3f042e61-689e-4f59-86ad-cbe0c92bf2f0',
  year: 1994,
  make: 'Mazda',
  model: 'Miata MX-5',
  trim: 'R-Package',
  body_style: 'Convertible',
  vin: 'JM1NA351*R0******',
  purchase_date: '2024-03-15',
  purchase_price: 6500,
  current_mileage: 124200,
  is_primary: true,
  created_at: new Date('2026-06-18T12:00:00Z').toISOString()
}

// Get all vehicles for the current user
export async function getVehicles(): Promise<VehicleData[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching vehicles from Supabase:', error)
      } else if (data && data.length > 0) {
        return data as VehicleData[]
      }
    } catch (e) {
      console.error('Failed to get vehicles from Supabase:', e)
    }
  }

  // Fallback to cookie-based storage
  const cookieStore = await cookies()
  const vehiclesCookie = cookieStore.get('garagebook_vehicles')

  if (!vehiclesCookie) {
    // Return sample data if no vehicles exist — don't set cookies during render
    return [SAMPLE_MIATA]
  }

  try {
    const list = JSON.parse(vehiclesCookie.value) as VehicleData[]
    // Filter to current user's mock vehicles
    return list.filter(v => v.user_id === user.id)
  } catch {
    return []
  }
}

// Get a single vehicle by ID
export async function getVehicleById(id: string): Promise<VehicleData | null> {
  const vehicles = await getVehicles()
  return vehicles.find(v => v.id === id) || null
}

// VIN Decoder Action utilizing NHTSA API
export async function decodeVin(vin: string) {
  if (!vin || vin.length < 8) {
    return { error: 'VIN must be at least 8 characters long.' }
  }

  try {
    const sanitizedVin = vin.trim().toUpperCase()
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${sanitizedVin}?format=json`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      return { error: 'Failed to contact NHTSA VIN decoding service.' }
    }

    const data = await response.json()
    const results = data.Results?.[0]

    if (!results) {
      return { error: 'No vehicle data returned from NHTSA.' }
    }

    // Checking if it found a valid model or make
    const make = results.Make || ''
    const model = results.Model || ''
    const yearStr = results.ModelYear || ''
    const year = yearStr ? parseInt(yearStr, 10) : null
    const trim = results.Trim || null
    const bodyClass = results.BodyClass || null

    if (!make && !model) {
      return { error: 'Could not decode VIN. Please enter details manually.' }
    }

    return {
      success: true,
      data: {
        year,
        make,
        model,
        trim,
        bodyStyle: bodyClass,
      }
    }
  } catch (error) {
    console.error('VIN decoding error:', error)
    return { error: 'An unexpected error occurred while decoding the VIN.' }
  }
}

// Create a new vehicle
export async function createVehicle(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'You must be logged in to add a vehicle.' }
  }

  // Check Free Tier vehicle limit
  if (!user.is_pro) {
    const existingVehicles = await getVehicles()
    if (existingVehicles.length >= 1) {
      return {
        error: 'Free accounts are limited to 1 vehicle. Please upgrade to Pro in your Profile settings to add unlimited vehicles!'
      }
    }
  }

  // Extract form fields
  const yearStr = formData.get('year') as string
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const trim = formData.get('trim') as string || null
  const bodyStyle = formData.get('body_style') as string || null
  const vin = formData.get('vin') as string || null
  const purchaseDate = formData.get('purchase_date') as string || null
  const purchasePriceStr = formData.get('purchase_price') as string
  const currentMileageStr = formData.get('current_mileage') as string
  const isPrimary = formData.get('is_primary') === 'true'

  // Validation
  const year = parseInt(yearStr, 10)
  if (isNaN(year) || year < 1886 || year > new Date().getFullYear() + 2) {
    return { error: 'Please enter a valid model year.' }
  }
  if (!make || !model) {
    return { error: 'Make and Model are required fields.' }
  }

  const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : null
  const currentMileage = currentMileageStr ? parseInt(currentMileageStr, 10) : null

  const newVehicle: VehicleData = {
    id: crypto.randomUUID(),
    user_id: user.id,
    year,
    make: make.trim(),
    model: model.trim(),
    trim: trim ? trim.trim() : null,
    body_style: bodyStyle ? bodyStyle.trim() : null,
    vin: vin ? vin.trim().toUpperCase() : null,
    purchase_date: purchaseDate,
    purchase_price: purchasePrice && !isNaN(purchasePrice) ? purchasePrice : null,
    current_mileage: currentMileage && !isNaN(currentMileage) ? currentMileage : null,
    is_primary: isPrimary,
    created_at: new Date().toISOString()
  }

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()

      // If this is set as primary, set all other vehicles to not primary
      if (isPrimary) {
        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('user_id', user.id)
      }

      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          user_id: newVehicle.user_id,
          year: newVehicle.year,
          make: newVehicle.make,
          model: newVehicle.model,
          trim: newVehicle.trim,
          body_style: newVehicle.body_style,
          vin: newVehicle.vin,
          purchase_date: newVehicle.purchase_date,
          purchase_price: newVehicle.purchase_price,
          current_mileage: newVehicle.current_mileage,
          is_primary: newVehicle.is_primary,
        })
        .select()
        .single()

      if (error) {
        return { error: error.message }
      }

      revalidatePath('/')
      return { success: true, vehicle: data }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to save vehicle to Supabase.' }
    }
  }

  // Fallback Cookie-based storage
  const cookieStore = await cookies()
  const vehiclesCookie = cookieStore.get('garagebook_vehicles')
  let list: VehicleData[] = []

  if (vehiclesCookie) {
    try {
      list = JSON.parse(vehiclesCookie.value) as VehicleData[]
    } catch {
      list = []
    }
  }

  // If this is primary or if it's the first vehicle, ensure other vehicles are not primary
  if (isPrimary || list.filter(v => v.user_id === user.id).length === 0) {
    newVehicle.is_primary = true
    list = list.map(v => v.user_id === user.id ? { ...v, is_primary: false } : v)
  }

  list.push(newVehicle)
  cookieStore.set('garagebook_vehicles', JSON.stringify(list), { path: '/' })

  revalidatePath('/')
  return { success: true, vehicle: newVehicle }
}

// Update vehicle details
export async function updateVehicle(id: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'You must be logged in to update a vehicle.' }
  }

  // Extract form fields
  const yearStr = formData.get('year') as string
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const trim = formData.get('trim') as string || null
  const bodyStyle = formData.get('body_style') as string || null
  const vin = formData.get('vin') as string || null
  const purchaseDate = formData.get('purchase_date') as string || null
  const purchasePriceStr = formData.get('purchase_price') as string
  const currentMileageStr = formData.get('current_mileage') as string
  const isPrimary = formData.get('is_primary') === 'true'

  // Validation
  const year = parseInt(yearStr, 10)
  if (isNaN(year) || year < 1886 || year > new Date().getFullYear() + 2) {
    return { error: 'Please enter a valid model year.' }
  }
  if (!make || !model) {
    return { error: 'Make and Model are required fields.' }
  }

  const purchasePrice = purchasePriceStr ? parseFloat(purchasePriceStr) : null
  const currentMileage = currentMileageStr ? parseInt(currentMileageStr, 10) : null

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()

      // If this is primary, set all other vehicles to not primary
      if (isPrimary) {
        await supabase
          .from('vehicles')
          .update({ is_primary: false })
          .eq('user_id', user.id)
      }

      const { error } = await supabase
        .from('vehicles')
        .update({
          year,
          make: make.trim(),
          model: model.trim(),
          trim: trim ? trim.trim() : null,
          body_style: bodyStyle ? bodyStyle.trim() : null,
          vin: vin ? vin.trim().toUpperCase() : null,
          purchase_date: purchaseDate,
          purchase_price: purchasePrice && !isNaN(purchasePrice) ? purchasePrice : null,
          current_mileage: currentMileage && !isNaN(currentMileage) ? currentMileage : null,
          is_primary: isPrimary,
        })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return { error: error.message }
      }

      revalidatePath('/')
      revalidatePath(`/vehicles/${id}`)
      return { success: true }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to update vehicle in Supabase.' }
    }
  }

  // Fallback cookie update
  const cookieStore = await cookies()
  const vehiclesCookie = cookieStore.get('garagebook_vehicles')
  if (!vehiclesCookie) {
    return { error: 'No vehicles found in local sandbox.' }
  }

  try {
    let list = JSON.parse(vehiclesCookie.value) as VehicleData[]
    const index = list.findIndex(v => v.id === id && v.user_id === user.id)
    if (index === -1) {
      return { error: 'Vehicle not found.' }
    }

    if (isPrimary) {
      list = list.map(v => v.user_id === user.id ? { ...v, is_primary: false } : v)
    }

    list[index] = {
      ...list[index],
      year,
      make: make.trim(),
      model: model.trim(),
      trim: trim ? trim.trim() : null,
      body_style: bodyStyle ? bodyStyle.trim() : null,
      vin: vin ? vin.trim().toUpperCase() : null,
      purchase_date: purchaseDate,
      purchase_price: purchasePrice && !isNaN(purchasePrice) ? purchasePrice : null,
      current_mileage: currentMileage && !isNaN(currentMileage) ? currentMileage : null,
      is_primary: isPrimary || list[index].is_primary, // keep primary if it already was and isn't toggled false, but if it was primary and other is primary it got set to false above
    }

    cookieStore.set('garagebook_vehicles', JSON.stringify(list), { path: '/' })
    revalidatePath('/')
    revalidatePath(`/vehicles/${id}`)
    return { success: true }
  } catch {
    return { error: 'Failed to update vehicle.' }
  }
}

// Delete vehicle
export async function deleteVehicle(id: string) {
  const user = await getCurrentUser()
  if (!user) {
    return { error: 'You must be logged in to delete a vehicle.' }
  }

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        return { error: error.message }
      }

      revalidatePath('/')
      return { success: true }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to delete vehicle.' }
    }
  }

  // Fallback cookie deletion
  const cookieStore = await cookies()
  const vehiclesCookie = cookieStore.get('garagebook_vehicles')
  if (!vehiclesCookie) {
    return { error: 'No vehicles found.' }
  }

  try {
    let list = JSON.parse(vehiclesCookie.value) as VehicleData[]
    const toDelete = list.find(v => v.id === id && v.user_id === user.id)
    
    list = list.filter(v => !(v.id === id && v.user_id === user.id))
    
    // If we deleted the primary, make another vehicle primary if available
    if (toDelete?.is_primary && list.filter(v => v.user_id === user.id).length > 0) {
      const remainingUserVehicles = list.filter(v => v.user_id === user.id)
      remainingUserVehicles[0].is_primary = true
      list = list.map(v => v.id === remainingUserVehicles[0].id ? { ...v, is_primary: true } : v)
    }

    cookieStore.set('garagebook_vehicles', JSON.stringify(list), { path: '/' })
    revalidatePath('/')
    return { success: true }
  } catch {
    return { error: 'Failed to delete vehicle.' }
  }
}

// ==========================================
// MAINTENANCE RECORDS ACTIONS
// ==========================================

export interface ServiceRecord {
  id: string
  vehicle_id: string
  service_date: string
  mileage: number
  service_type: string
  description: string | null
  cost: number
  shop_name: string | null
  receipt_url: string | null
  created_at: string
}

const SAMPLE_SERVICE_RECORDS: ServiceRecord[] = [
  {
    id: 'demo-service-1',
    vehicle_id: 'demo-miata-1994',
    service_date: '2026-06-10',
    mileage: 124150,
    service_type: 'Oil Change & Filter',
    description: 'Mobil1 10W-30 Synthetic oil with OEM filter',
    cost: 45.00,
    shop_name: 'Garage DIY',
    receipt_url: null,
    created_at: new Date('2026-06-10T14:00:00Z').toISOString()
  }
]

export async function getServiceRecords(vehicleId: string): Promise<ServiceRecord[]> {
  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false })

      if (error) {
        console.error('Error fetching maintenance records:', error)
      } else if (data) {
        return data as ServiceRecord[]
      }
    } catch (e) {
      console.error('Failed to get maintenance records from Supabase:', e)
    }
  }

  // Fallback to cookie
  const cookieStore = await cookies()
  const maintenanceCookie = cookieStore.get('garagebook_maintenance')

  if (!maintenanceCookie) {
    if (vehicleId === 'demo-miata-1994') {
      cookieStore.set('garagebook_maintenance', JSON.stringify(SAMPLE_SERVICE_RECORDS), { path: '/' })
      return SAMPLE_SERVICE_RECORDS
    }
    return []
  }

  try {
    const list = JSON.parse(maintenanceCookie.value) as ServiceRecord[]
    return list.filter(r => r.vehicle_id === vehicleId).sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime())
  } catch {
    return []
  }
}

// Auto-sync vehicle odometer when a service record logs higher mileage
async function syncVehicleMileage(vehicleId: string, newMileage: number) {
  const user = await getCurrentUser()
  if (!user) return

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data: vehicle } = await supabase
        .from('vehicles')
        .select('current_mileage')
        .eq('id', vehicleId)
        .single()

      if (vehicle && (!vehicle.current_mileage || newMileage > vehicle.current_mileage)) {
        await supabase
          .from('vehicles')
          .update({ current_mileage: newMileage })
          .eq('id', vehicleId)
      }
    } catch (e) {
      console.error('Failed to sync mileage:', e)
    }
    return
  }

  // Fallback cookie-based sync
  const cookieStore = await cookies()
  const vehiclesCookie = cookieStore.get('garagebook_vehicles')
  if (!vehiclesCookie) return

  try {
    const list = JSON.parse(vehiclesCookie.value) as VehicleData[]
    const idx = list.findIndex(v => v.id === vehicleId)
    if (idx !== -1) {
      const current = list[idx].current_mileage
      if (!current || newMileage > current) {
        list[idx].current_mileage = newMileage
        cookieStore.set('garagebook_vehicles', JSON.stringify(list), { path: '/' })
      }
    }
  } catch {
    // ignore
  }
}

export async function addServiceRecord(vehicleId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not logged in' }

  const serviceDate = formData.get('service_date') as string
  const mileageStr = formData.get('mileage') as string
  const serviceType = formData.get('service_type') as string
  const description = formData.get('description') as string || null
  const costStr = formData.get('cost') as string
  const shopName = formData.get('shop_name') as string || null
  const receiptData = formData.get('receipt_data') as string || null

  const mileage = parseInt(mileageStr, 10)
  const cost = costStr ? parseFloat(costStr) : 0

  if (!serviceDate || isNaN(mileage) || !serviceType) {
    return { error: 'Service date, mileage, and service type are required fields.' }
  }

  const newRecord: ServiceRecord = {
    id: crypto.randomUUID(),
    vehicle_id: vehicleId,
    service_date: serviceDate,
    mileage,
    service_type: serviceType.trim(),
    description: description ? description.trim() : null,
    cost: isNaN(cost) ? 0 : cost,
    shop_name: shopName ? shopName.trim() : null,
    receipt_url: receiptData || null,
    created_at: new Date().toISOString()
  }

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('maintenance_records')
        .insert({
          vehicle_id: vehicleId,
          service_date: newRecord.service_date,
          mileage: newRecord.mileage,
          service_type: newRecord.service_type,
          description: newRecord.description,
          cost: newRecord.cost,
          shop_name: newRecord.shop_name,
          receipt_url: newRecord.receipt_url,
        })
        .select()
        .single()

      if (error) return { error: error.message }

      // Sync mileage if higher
      await syncVehicleMileage(vehicleId, mileage)

      revalidatePath(`/vehicles/${vehicleId}`)
      revalidatePath('/')
      return { success: true, record: data }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to save service record.' }
    }
  }

  // Fallback to cookie
  const cookieStore = await cookies()
  const maintenanceCookie = cookieStore.get('garagebook_maintenance')
  let list: ServiceRecord[] = []

  if (maintenanceCookie) {
    try {
      list = JSON.parse(maintenanceCookie.value) as ServiceRecord[]
    } catch {
      list = []
    }
  }

  list.push(newRecord)
  cookieStore.set('garagebook_maintenance', JSON.stringify(list), { path: '/' })

  // Sync mileage if higher (cookie fallback)
  await syncVehicleMileage(vehicleId, mileage)

  revalidatePath(`/vehicles/${vehicleId}`)
  revalidatePath('/')
  return { success: true, record: newRecord }
}

// ==========================================
// MODIFICATIONS ACTIONS
// ==========================================

export interface ModificationRecord {
  id: string
  vehicle_id: string
  install_date: string
  part_name: string
  brand: string | null
  category: string | null
  cost: number
  notes: string | null
  photo_url: string | null
  created_at: string
}

const SAMPLE_MODS: ModificationRecord[] = [
  {
    id: 'demo-mod-1',
    vehicle_id: 'demo-miata-1994',
    install_date: '2026-05-28',
    part_name: 'Koni Yellow Shocks Installed',
    brand: 'Koni',
    category: 'Suspension',
    cost: 650.00,
    notes: 'Paired with Flyin\' Miata lowering springs. Alignment done.',
    photo_url: null,
    created_at: new Date('2026-05-28T14:00:00Z').toISOString()
  }
]

export async function getModifications(vehicleId: string): Promise<ModificationRecord[]> {
  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('modifications')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('install_date', { ascending: false })

      if (error) {
        console.error('Error fetching modifications:', error)
      } else if (data) {
        return data as ModificationRecord[]
      }
    } catch (e) {
      console.error('Failed to get modifications from Supabase:', e)
    }
  }

  // Fallback to cookie
  const cookieStore = await cookies()
  const modsCookie = cookieStore.get('garagebook_modifications')

  if (!modsCookie) {
    if (vehicleId === 'demo-miata-1994') {
      cookieStore.set('garagebook_modifications', JSON.stringify(SAMPLE_MODS), { path: '/' })
      return SAMPLE_MODS
    }
    return []
  }

  try {
    const list = JSON.parse(modsCookie.value) as ModificationRecord[]
    return list.filter(r => r.vehicle_id === vehicleId).sort((a, b) => new Date(b.install_date).getTime() - new Date(a.install_date).getTime())
  } catch {
    return []
  }
}

export async function addModification(vehicleId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not logged in' }

  const installDate = formData.get('install_date') as string
  const partName = formData.get('part_name') as string
  const brand = formData.get('brand') as string || null
  const category = formData.get('category') as string || null
  const costStr = formData.get('cost') as string
  const notes = formData.get('notes') as string || null

  const cost = costStr ? parseFloat(costStr) : 0

  if (!installDate || !partName) {
    return { error: 'Install date and part name are required fields.' }
  }

  const newRecord: ModificationRecord = {
    id: crypto.randomUUID(),
    vehicle_id: vehicleId,
    install_date: installDate,
    part_name: partName.trim(),
    brand: brand ? brand.trim() : null,
    category: category ? category.trim() : null,
    cost: isNaN(cost) ? 0 : cost,
    notes: notes ? notes.trim() : null,
    photo_url: null,
    created_at: new Date().toISOString()
  }

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('modifications')
        .insert({
          vehicle_id: vehicleId,
          install_date: newRecord.install_date,
          part_name: newRecord.part_name,
          brand: newRecord.brand,
          category: newRecord.category,
          cost: newRecord.cost,
          notes: newRecord.notes,
        })
        .select()
        .single()

      if (error) return { error: error.message }
      revalidatePath(`/vehicles/${vehicleId}`)
      revalidatePath('/')
      return { success: true, modification: data }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to save modification.' }
    }
  }

  // Fallback to cookie
  const cookieStore = await cookies()
  const modsCookie = cookieStore.get('garagebook_modifications')
  let list: ModificationRecord[] = []

  if (modsCookie) {
    try {
      list = JSON.parse(modsCookie.value) as ModificationRecord[]
    } catch {
      list = []
    }
  }

  list.push(newRecord)
  cookieStore.set('garagebook_modifications', JSON.stringify(list), { path: '/' })
  revalidatePath(`/vehicles/${vehicleId}`)
  revalidatePath('/')
  return { success: true, modification: newRecord }
}

// ==========================================
// EXPENSES ACTIONS
// ==========================================

export interface ExpenseRecord {
  id: string
  vehicle_id: string
  expense_date: string
  category: string
  amount: number
  description: string | null
  mileage: number | null
  created_at: string
}

const SAMPLE_EXPENSES: ExpenseRecord[] = [
  {
    id: 'demo-expense-1',
    vehicle_id: 'demo-miata-1994',
    expense_date: '2026-06-14',
    category: 'Fuel',
    amount: 42.50,
    description: '93 Octane Shell V-Power - 10.2 gallons',
    mileage: 124190,
    created_at: new Date('2026-06-14T14:00:00Z').toISOString()
  }
]

export async function getExpenses(vehicleId: string): Promise<ExpenseRecord[]> {
  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('expense_date', { ascending: false })

      if (error) {
        console.error('Error fetching expenses:', error)
      } else if (data) {
        return data as ExpenseRecord[]
      }
    } catch (e) {
      console.error('Failed to get expenses from Supabase:', e)
    }
  }

  // Fallback to cookie
  const cookieStore = await cookies()
  const expensesCookie = cookieStore.get('garagebook_expenses')

  if (!expensesCookie) {
    if (vehicleId === 'demo-miata-1994') {
      cookieStore.set('garagebook_expenses', JSON.stringify(SAMPLE_EXPENSES), { path: '/' })
      return SAMPLE_EXPENSES
    }
    return []
  }

  try {
    const list = JSON.parse(expensesCookie.value) as ExpenseRecord[]
    return list.filter(r => r.vehicle_id === vehicleId).sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
  } catch {
    return []
  }
}

export async function addExpense(vehicleId: string, formData: FormData) {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not logged in' }

  const expenseDate = formData.get('expense_date') as string
  const category = formData.get('category') as string
  const amountStr = formData.get('amount') as string
  const description = formData.get('description') as string || null
  const mileageStr = formData.get('mileage') as string || null

  const amount = parseFloat(amountStr)
  const mileage = mileageStr ? parseInt(mileageStr, 10) : null

  if (!expenseDate || !category || isNaN(amount)) {
    return { error: 'Expense date, category, and amount are required fields.' }
  }

  const newRecord: ExpenseRecord = {
    id: crypto.randomUUID(),
    vehicle_id: vehicleId,
    expense_date: expenseDate,
    category: category.trim(),
    amount,
    description: description ? description.trim() : null,
    mileage: mileage && !isNaN(mileage) ? mileage : null,
    created_at: new Date().toISOString()
  }

  const hasRealKeys = await isSupabaseConfigured()

  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          vehicle_id: vehicleId,
          expense_date: newRecord.expense_date,
          category: newRecord.category,
          amount: newRecord.amount,
          description: newRecord.description,
          mileage: newRecord.mileage,
        })
        .select()
        .single()

      if (error) return { error: error.message }
      revalidatePath(`/vehicles/${vehicleId}`)
      revalidatePath('/')
      return { success: true, expense: data }
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to save expense.' }
    }
  }

  // Fallback to cookie
  const cookieStore = await cookies()
  const expensesCookie = cookieStore.get('garagebook_expenses')
  let list: ExpenseRecord[] = []

  if (expensesCookie) {
    try {
      list = JSON.parse(expensesCookie.value) as ExpenseRecord[]
    } catch {
      list = []
    }
  }

  list.push(newRecord)
  cookieStore.set('garagebook_expenses', JSON.stringify(list), { path: '/' })
  revalidatePath(`/vehicles/${vehicleId}`)
  revalidatePath('/')
  return { success: true, expense: newRecord }
}
