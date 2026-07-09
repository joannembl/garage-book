'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { isSupabaseConfigured } from './auth'
import type {
  VehicleData,
  ServiceRecord,
  ModificationRecord,
  ExpenseRecord,
} from './vehicles'

export interface ReportData {
  vehicle: VehicleData
  services: ServiceRecord[]
  modifications: ModificationRecord[]
  expenses: ExpenseRecord[]
  totals: {
    purchase_price: number
    service_cost: number
    mod_cost: number
    expenses_total: number
    grand_total: number
    service_count: number
    mod_count: number
    expense_count: number
  }
}

/**
 * Collects full report data for a vehicle.
 * Works identically for Supabase and mock/fallback cookie modes.
 */
export async function getVehicleReportData(
  vehicleId: string
): Promise<ReportData | { error: string }> {
  try {
    // Fetch vehicle
    const vehicles = await getAllVehiclesRaw()
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    if (!vehicle) return { error: 'Vehicle not found.' }

    // Fetch all record types in parallel
    const [services, modifications, expenses] = await Promise.all([
      getServicesRaw(vehicleId),
      getModificationsRaw(vehicleId),
      getExpensesRaw(vehicleId),
    ])

    // Calculate totals
    const purchase_price = vehicle.purchase_price || 0
    const service_cost = services.reduce((s, r) => s + r.cost, 0)
    const mod_cost = modifications.reduce((s, m) => s + m.cost, 0)
    const expenses_total = expenses.reduce((s, e) => s + e.amount, 0)
    const grand_total = purchase_price + service_cost + mod_cost + expenses_total

    return {
      vehicle,
      services,
      modifications,
      expenses,
      totals: {
        purchase_price,
        service_cost,
        mod_cost,
        expenses_total,
        grand_total,
        service_count: services.length,
        mod_count: modifications.length,
        expense_count: expenses.length,
      },
    }
  } catch (e) {
    console.error('Report generation error:', e)
    return { error: 'Failed to load vehicle report data.' }
  }
}

// ---------- Internal helpers that duplicate the existing action logic ----------
// These exist so we don't import server-actions-with-side-effects inside one another.

async function getAllVehiclesRaw(): Promise<VehicleData[]> {
  const hasRealKeys = await isSupabaseConfigured()
  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.from('vehicles').select('*')
      if (data && data.length > 0) return data as VehicleData[]
    } catch {
      // fall through
    }
  }
  const cookieStore = await cookies()
  const c = cookieStore.get('garagebook_vehicles')
  if (!c) return []
  try {
    return JSON.parse(c.value) as VehicleData[]
  } catch {
    return []
  }
}

async function getServicesRaw(vehicleId: string): Promise<ServiceRecord[]> {
  const hasRealKeys = await isSupabaseConfigured()
  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('service_date', { ascending: false })
      if (data) return data as ServiceRecord[]
    } catch {
      // fall through
    }
  }
  const cookieStore = await cookies()
  const c = cookieStore.get('garagebook_maintenance')
  if (!c) return []
  try {
    const list = JSON.parse(c.value) as ServiceRecord[]
    return list
      .filter((r) => r.vehicle_id === vehicleId)
      .sort(
        (a, b) =>
          new Date(b.service_date).getTime() -
          new Date(a.service_date).getTime()
      )
  } catch {
    return []
  }
}

async function getModificationsRaw(
  vehicleId: string
): Promise<ModificationRecord[]> {
  const hasRealKeys = await isSupabaseConfigured()
  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('modifications')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('install_date', { ascending: false })
      if (data) return data as ModificationRecord[]
    } catch {
      // fall through
    }
  }
  const cookieStore = await cookies()
  const c = cookieStore.get('garagebook_modifications')
  if (!c) return []
  try {
    const list = JSON.parse(c.value) as ModificationRecord[]
    return list
      .filter((r) => r.vehicle_id === vehicleId)
      .sort(
        (a, b) =>
          new Date(b.install_date).getTime() -
          new Date(a.install_date).getTime()
      )
  } catch {
    return []
  }
}

async function getExpensesRaw(vehicleId: string): Promise<ExpenseRecord[]> {
  const hasRealKeys = await isSupabaseConfigured()
  if (hasRealKeys) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('expense_date', { ascending: false })
      if (data) return data as ExpenseRecord[]
    } catch {
      // fall through
    }
  }
  const cookieStore = await cookies()
  const c = cookieStore.get('garagebook_expenses')
  if (!c) return []
  try {
    const list = JSON.parse(c.value) as ExpenseRecord[]
    return list
      .filter((r) => r.vehicle_id === vehicleId)
      .sort(
        (a, b) =>
          new Date(b.expense_date).getTime() -
          new Date(a.expense_date).getTime()
      )
  } catch {
    return []
  }
}