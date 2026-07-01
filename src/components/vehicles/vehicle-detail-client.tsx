'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Car, Wrench, Sliders, Receipt, DollarSign, Gauge,
  Edit2, Trash2, Loader2, AlertCircle, PieChart,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  updateVehicle, deleteVehicle, decodeVin,
  getServiceRecords, addServiceRecord,
  getModifications, addModification,
  getExpenses, addExpense,
  VehicleData, ServiceRecord, ModificationRecord, ExpenseRecord,
} from '@/app/actions/vehicles'
import { OverviewTab } from '@/components/vehicles/vehicle-overview-tab'
import { ServiceTab } from '@/components/vehicles/vehicle-service-tab'
import { ModsTab } from '@/components/vehicles/vehicle-mods-tab'
import { ExpensesTab } from '@/components/vehicles/vehicle-expenses-tab'

interface VehicleDetailClientProps {
  vehicle: VehicleData
}

type TabId = 'overview' | 'service' | 'mods' | 'expenses'

export function VehicleDetailClient({ vehicle }: VehicleDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Dynamic data
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [mods, setMods] = useState<ModificationRecord[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)

  // Active tab
  const initialTab = (searchParams.get('tab') as TabId) || 'overview'
  const [activeTab, setActiveTab] = useState<TabId>(initialTab)

  // Edit Vehicle dialog
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editVin, setEditVin] = useState(vehicle.vin || '')
  const [isDecoding, setIsDecoding] = useState(false)
  const [decodeSuccess, setDecodeSuccess] = useState(false)
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [editYear, setEditYear] = useState(vehicle.year.toString())
  const [editMake, setEditMake] = useState(vehicle.make)
  const [editModel, setEditModel] = useState(vehicle.model)
  const [editTrim, setEditTrim] = useState(vehicle.trim || '')
  const [editBodyStyle, setEditBodyStyle] = useState(vehicle.body_style || '')
  const [editPurchaseDate, setEditPurchaseDate] = useState(vehicle.purchase_date || '')
  const [editPurchasePrice, setEditPurchasePrice] = useState(vehicle.purchase_price?.toString() || '')
  const [editCurrentMileage, setEditCurrentMileage] = useState(vehicle.current_mileage?.toString() || '')
  const [editIsPrimary, setEditIsPrimary] = useState(vehicle.is_primary)
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // Delete dialog
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Fetch all records
  const fetchAllLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const [servicesData, modsData, expensesData] = await Promise.all([
        getServiceRecords(vehicle.id),
        getModifications(vehicle.id),
        getExpenses(vehicle.id),
      ])
      setServices(servicesData)
      setMods(modsData)
      setExpenses(expensesData)
    } catch (e) {
      console.error('Failed to load logs:', e)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  useEffect(() => { fetchAllLogs() }, [vehicle.id])

  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabId
    if (tabParam) setActiveTab(tabParam)
  }, [searchParams])

  // VIN Decode for Edit
  const handleDecodeVin = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!editVin || editVin.trim().length < 8) { setDecodeError('Please enter at least 8 characters.'); return }
    setIsDecoding(true); setDecodeError(null); setDecodeSuccess(false)
    try {
      const result = await decodeVin(editVin)
      if (result.error) setDecodeError(result.error)
      else if (result.success && result.data) {
        const d = result.data
        if (d.year) setEditYear(d.year.toString())
        if (d.make) setEditMake(d.make)
        if (d.model) setEditModel(d.model)
        if (d.trim) setEditTrim(d.trim)
        if (d.bodyStyle) setEditBodyStyle(d.bodyStyle)
        setDecodeSuccess(true)
      }
    } catch { setDecodeError('Unexpected error during decoding.') }
    finally { setIsDecoding(false) }
  }

  // Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editYear || !editMake || !editModel) { setEditError('Year, Make, and Model are required.'); return }
    setIsEditSubmitting(true); setEditError(null)
    const formData = new FormData()
    formData.append('year', editYear); formData.append('make', editMake); formData.append('model', editModel)
    formData.append('trim', editTrim); formData.append('body_style', editBodyStyle); formData.append('vin', editVin)
    formData.append('purchase_date', editPurchaseDate); formData.append('purchase_price', editPurchasePrice)
    formData.append('current_mileage', editCurrentMileage); formData.append('is_primary', editIsPrimary ? 'true' : 'false')
    try {
      const result = await updateVehicle(vehicle.id, formData)
      if (result.error) setEditError(result.error)
      else { setIsEditOpen(false); router.refresh() }
    } catch { setEditError('Failed to update vehicle details.') }
    finally { setIsEditSubmitting(false) }
  }

  // Delete Vehicle
  const handleDeleteVehicle = async () => {
    setIsDeleting(true); setDeleteError(null)
    try {
      const result = await deleteVehicle(vehicle.id)
      if (result.error) setDeleteError(result.error)
      else { setIsDeleteOpen(false); router.push('/'); router.refresh() }
    } catch { setDeleteError('An error occurred during deletion.') }
    finally { setIsDeleting(false) }
  }

  // Quick action handlers
  const handleAddService = async (formData: FormData) => {
    const result = await addServiceRecord(vehicle.id, formData)
    if (result.error) throw new Error(result.error)
    fetchAllLogs()
  }

  const handleAddMod = async (formData: FormData) => {
    const result = await addModification(vehicle.id, formData)
    if (result.error) throw new Error(result.error)
    fetchAllLogs()
  }

  const handleAddExpense = async (formData: FormData) => {
    const result = await addExpense(vehicle.id, formData)
    if (result.error) throw new Error(result.error)
    fetchAllLogs()
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-primary/5 rounded-full filter blur-3xl" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                {vehicle.is_primary && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full uppercase">Primary Build</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{vehicle.trim || 'Base Edition'} • {vehicle.body_style || 'Hatchback/Coupe'}</p>
            </div>
          </div>

          {/* Edit/Delete Actions */}
          <div className="flex gap-2 shrink-0">
            {/* Edit Button */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <Button variant="outline" size="sm" className="text-xs font-semibold h-9"
                onClick={() => {
                  setEditVin(vehicle.vin || ''); setEditYear(vehicle.year.toString()); setEditMake(vehicle.make)
                  setEditModel(vehicle.model); setEditTrim(vehicle.trim || ''); setEditBodyStyle(vehicle.body_style || '')
                  setEditPurchaseDate(vehicle.purchase_date || ''); setEditPurchasePrice(vehicle.purchase_price?.toString() || '')
                  setEditCurrentMileage(vehicle.current_mileage?.toString() || ''); setEditIsPrimary(vehicle.is_primary)
                  setDecodeError(null); setDecodeSuccess(false); setEditError(null); setIsEditOpen(true)
                }}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" /><span>Edit Specs</span>
              </Button>

              <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Edit Vehicle Specifications</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">Modify details below or re-decode the VIN using NHTSA databases.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                  <div className="rounded-xl border bg-secondary/10 p-4 space-y-2">
                    <label className="text-xs font-bold text-foreground block">VIN Decoder</label>
                    <div className="flex gap-2">
                      <Input placeholder="Enter 17-character VIN" value={editVin} onChange={(e) => setEditVin(e.target.value)} className="h-9 font-mono text-xs uppercase" maxLength={17} />
                      <Button type="button" variant="secondary" size="sm" disabled={isDecoding || !editVin} onClick={handleDecodeVin} className="h-9 px-3 shrink-0 text-xs">
                        {isDecoding ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Decode'}
                      </Button>
                    </div>
                    {decodeError && <p className="text-[10px] text-destructive">{decodeError}</p>}
                    {decodeSuccess && <p className="text-[10px] text-emerald-600">NHTSA fields imported!</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1"><label className="text-[11px] font-semibold text-muted-foreground">Year *</label><Input type="number" value={editYear} onChange={(e) => setEditYear(e.target.value)} className="h-9 text-xs" required /></div>
                    <div className="space-y-1 col-span-2"><label className="text-[11px] font-semibold text-muted-foreground">Make *</label><Input value={editMake} onChange={(e) => setEditMake(e.target.value)} className="h-9 text-xs" required /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[11px] font-semibold text-muted-foreground">Model *</label><Input value={editModel} onChange={(e) => setEditModel(e.target.value)} className="h-9 text-xs" required /></div>
                    <div className="space-y-1"><label className="text-[11px] font-semibold text-muted-foreground">Trim</label><Input value={editTrim} onChange={(e) => setEditTrim(e.target.value)} className="h-9 text-xs" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-[11px] font-semibold text-muted-foreground">Body Style</label><Input value={editBodyStyle} onChange={(e) => setEditBodyStyle(e.target.value)} className="h-9 text-xs" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1"><label className="text-[11px] font-semibold text-muted-foreground">Purchase Date</label><Input type="date" value={editPurchaseDate} onChange={(e) => setEditPurchaseDate(e.target.value)} className="h-9 text-xs" /></div>
                    <div className="space-y-1"><label className="text-[11px] font-semibold text-muted-foreground">Purchase Price ($)</label><Input type="number" step="0.01" value={editPurchasePrice} onChange={(e) => setEditPurchasePrice(e.target.value)} className="h-9 text-xs" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div className="space-y-1"><label className="text-[11px] font-semibold text-muted-foreground">Odometer (mi)</label><Input type="number" value={editCurrentMileage} onChange={(e) => setEditCurrentMileage(e.target.value)} className="h-9 text-xs" /></div>
                    <div className="flex items-center h-9"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editIsPrimary} onChange={(e) => setEditIsPrimary(e.target.checked)} className="rounded text-primary h-4 w-4" /><span className="text-xs font-semibold">Primary Build</span></label></div>
                  </div>
                  {editError && <div className="text-xs text-destructive bg-destructive/10 border p-2 rounded flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /><span>{editError}</span></div>}
                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" className="text-xs" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={isEditSubmitting} className="text-xs">{isEditSubmitting ? 'Saving...' : 'Save Specs'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Button */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <Button variant="ghost" size="sm" className="text-xs font-semibold h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={() => setIsDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /><span>Delete</span>
              </Button>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2"><AlertCircle className="h-5 w-5" /><span>Confirm Delete Vehicle</span></DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">This action is <strong>permanent</strong>. It will completely delete this vehicle and all associated logs.</DialogDescription>
                </DialogHeader>
                {deleteError && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded">{deleteError}</p>}
                <DialogFooter className="sm:justify-end gap-2 pt-2">
                  <Button variant="outline" className="text-xs" disabled={isDeleting} onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
                  <Button variant="destructive" className="text-xs font-semibold" disabled={isDeleting} onClick={handleDeleteVehicle}>{isDeleting ? 'Deleting...' : 'Permanently Delete'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Odometer" icon={<Gauge className="h-4 w-4 text-primary" />} value={vehicle.current_mileage ? `${vehicle.current_mileage.toLocaleString()} mi` : 'Not logged'} sub="Active mileage reading" />
        <StatsCard label="Service Costs" icon={<Wrench className="h-4 w-4 text-amber-500" />} value={`$${services.reduce((s, r) => s + r.cost, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub={`${services.length} records completed`} />
        <StatsCard label="Mod Investments" icon={<Sliders className="h-4 w-4 text-violet-500" />} value={`$${mods.reduce((s, m) => s + m.cost, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub={`${mods.length} upgrades installed`} />
        <StatsCard label="Total Invested" icon={<DollarSign className="h-4 w-4 text-emerald-500" />} value={`$${(vehicle.purchase_price || 0) + services.reduce((s, r) => s + r.cost, 0) + mods.reduce((s, m) => s + m.cost, 0) + expenses.reduce((s, e) => s + e.amount, 0)}`} sub="Specs + upkeep + upgrades" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b overflow-x-auto whitespace-nowrap scrollbar-none">
        <TabButton id="overview" active={activeTab} label="Overview & Specs" icon={<PieChart className="h-4 w-4" />} onClick={setActiveTab} count={null} />
        <TabButton id="service" active={activeTab} label="Service Log" icon={<Wrench className="h-4 w-4" />} onClick={setActiveTab} count={services.length} />
        <TabButton id="mods" active={activeTab} label="Modifications" icon={<Sliders className="h-4 w-4" />} onClick={setActiveTab} count={mods.length} />
        <TabButton id="expenses" active={activeTab} label="Fuel & Expenses" icon={<Receipt className="h-4 w-4" />} onClick={setActiveTab} count={expenses.length} />
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewTab vehicle={vehicle} services={services} mods={mods} expenses={expenses} />}
        {activeTab === 'service' && <ServiceTab services={services} isLoading={isLoadingLogs} onAddService={handleAddService} />}
        {activeTab === 'mods' && <ModsTab mods={mods} isLoading={isLoadingLogs} onAddMod={handleAddMod} />}
        {activeTab === 'expenses' && <ExpensesTab expenses={expenses} isLoading={isLoadingLogs} onAddExpense={handleAddExpense} />}
      </div>
    </div>
  )
}

// ====== Internal UI Primitives ======

function StatsCard({ label, icon, value, sub }: { label: string; icon: React.ReactNode; value: string; sub: string }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
        <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-xl font-bold">{value}</div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

function TabButton({ id, active, label, icon, onClick, count }: {
  id: TabId; active: TabId; label: string; icon: React.ReactNode; onClick: (id: TabId) => void; count: number | null
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all duration-200 border-b-2 ${
        active === id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span>{label}{count !== null ? ` (${count})` : ''}</span>
    </button>
  )
}