'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Car,
  Wrench,
  Sliders,
  Receipt,
  DollarSign,
  Calendar,
  Gauge,
  
  Edit2,
  Trash2,
  Plus,
  Loader2,
  
  ,
  AlertCircle,
  TrendingUp,
  PieChart,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  updateVehicle,
  deleteVehicle,
  decodeVin,
  getServiceRecords,
  addServiceRecord,
  getModifications,
  addModification,
  getExpenses,
  addExpense,
  VehicleData,
  ServiceRecord,
  ModificationRecord,
  ExpenseRecord,
} from '@/app/actions/vehicles'

interface VehicleDetailClientProps {
  vehicle: VehicleData
  isPro: boolean
}

export function VehicleDetailClient({ vehicle, isPro }: VehicleDetailClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Dynamic lists from server actions
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [mods, setMods] = useState<ModificationRecord[]>([])
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  
  // Loading states
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)

  // Active tab state
  const initialTab = searchParams.get('tab') || 'overview'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Edit Vehicle dialog states
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

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Quick Add Log modals states
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [isAddModOpen, setIsAddModOpen] = useState(false)
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  const [isLogSubmitting, setIsLogSubmitting] = useState(false)
  const [logError, setLogError] = useState<string | null>(null)

  // Fetch all records for this vehicle
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

  useEffect(() => {
    fetchAllLogs()
  }, [vehicle.id])

  // Sync tab state with query param if it changes
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Handle Decode in Edit Modal
  const handleDecodeVin = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!editVin || editVin.trim().length < 8) {
      setDecodeError('Please enter at least 8 characters.')
      return
    }
    setIsDecoding(true)
    setDecodeError(null)
    setDecodeSuccess(false)
    try {
      const result = await decodeVin(editVin)
      if (result.error) {
        setDecodeError(result.error)
      } else if (result.success && result.data) {
        const d = result.data
        if (d.year) setEditYear(d.year.toString())
        if (d.make) setEditMake(d.make)
        if (d.model) setEditModel(d.model)
        if (d.trim) setEditTrim(d.trim)
        if (d.bodyStyle) setEditBodyStyle(d.bodyStyle)
        setDecodeSuccess(true)
      }
    } catch {
      setDecodeError('Unexpected error during decoding.')
    } finally {
      setIsDecoding(false)
    }
  }

  // Handle Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editYear || !editMake || !editModel) {
      setEditError('Year, Make, and Model are required.')
      return
    }
    setIsEditSubmitting(true)
    setEditError(null)

    const formData = new FormData()
    formData.append('year', editYear)
    formData.append('make', editMake)
    formData.append('model', editModel)
    formData.append('trim', editTrim)
    formData.append('body_style', editBodyStyle)
    formData.append('vin', editVin)
    formData.append('purchase_date', editPurchaseDate)
    formData.append('purchase_price', editPurchasePrice)
    formData.append('current_mileage', editCurrentMileage)
    formData.append('is_primary', editIsPrimary ? 'true' : 'false')

    try {
      const result = await updateVehicle(vehicle.id, formData)
      if (result.error) {
        setEditError(result.error)
      } else {
        setIsEditOpen(false)
        router.refresh()
      }
    } catch {
      setEditError('Failed to update vehicle details.')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  // Handle Delete
  const handleDeleteVehicle = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const result = await deleteVehicle(vehicle.id)
      if (result.error) {
        setDeleteError(result.error)
      } else {
        setIsDeleteOpen(false)
        router.push('/')
        router.refresh()
      }
    } catch {
      setDeleteError('An error occurred during deletion.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Add Log Actions
  const handleAddServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLogSubmitting(true)
    setLogError(null)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await addServiceRecord(vehicle.id, formData)
      if (result.error) {
        setLogError(result.error)
      } else {
        setIsAddServiceOpen(false)
        fetchAllLogs()
      }
    } catch {
      setLogError('Failed to add service record.')
    } finally {
      setIsLogSubmitting(false)
    }
  }

  const handleAddModSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLogSubmitting(true)
    setLogError(null)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await addModification(vehicle.id, formData)
      if (result.error) {
        setLogError(result.error)
      } else {
        setIsAddModOpen(false)
        fetchAllLogs()
      }
    } catch {
      setLogError('Failed to add modification.')
    } finally {
      setIsLogSubmitting(false)
    }
  }

  const handleAddExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLogSubmitting(true)
    setLogError(null)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await addExpense(vehicle.id, formData)
      if (result.error) {
        setLogError(result.error)
      } else {
        setIsAddExpenseOpen(false)
        fetchAllLogs()
      }
    } catch {
      setLogError('Failed to add expense.')
    } finally {
      setIsLogSubmitting(false)
    }
  }

  // Calculations for dynamic CSS charts
  const purchaseCost = vehicle.purchase_price || 0
  const serviceCostTotal = services.reduce((sum, s) => sum + s.cost, 0)
  const modsCostTotal = mods.reduce((sum, m) => sum + m.cost, 0)
  const expensesCostTotal = expenses.reduce((sum, e) => sum + e.amount, 0)
  const grandTotalCost = purchaseCost + serviceCostTotal + modsCostTotal + expensesCostTotal

  const purchasePercentage = grandTotalCost > 0 ? (purchaseCost / grandTotalCost) * 100 : 0
  const servicePercentage = grandTotalCost > 0 ? (serviceCostTotal / grandTotalCost) * 100 : 0
  const modsPercentage = grandTotalCost > 0 ? (modsCostTotal / grandTotalCost) * 100 : 0
  const expensesPercentage = grandTotalCost > 0 ? (expensesCostTotal / grandTotalCost) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Detail Welcome/Header Card */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden">
        {/* Decorative background accent */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-primary/5 rounded-full filter blur-3xl" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h2>
                {vehicle.is_primary && (
                  <span className="bg-primary text-primary-foreground text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full uppercase">
                    Primary Build
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {vehicle.trim || 'Base Edition'} • {vehicle.body_style || 'Hatchback/Coupe'}
              </p>
            </div>
          </div>

          {/* Edit/Delete Actions */}
          <div className="flex gap-2 shrink-0">
            {/* Edit Button */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs font-semibold h-9"
                onClick={() => {
                  setEditVin(vehicle.vin || '')
                  setEditYear(vehicle.year.toString())
                  setEditMake(vehicle.make)
                  setEditModel(vehicle.model)
                  setEditTrim(vehicle.trim || '')
                  setEditBodyStyle(vehicle.body_style || '')
                  setEditPurchaseDate(vehicle.purchase_date || '')
                  setEditPurchasePrice(vehicle.purchase_price?.toString() || '')
                  setEditCurrentMileage(vehicle.current_mileage?.toString() || '')
                  setEditIsPrimary(vehicle.is_primary)
                  setDecodeError(null)
                  setDecodeSuccess(false)
                  setEditError(null)
                  setIsEditOpen(true)
                }}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                <span>Edit Specs</span>
              </Button>

              <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Edit Vehicle Specifications</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Keep your vehicle metadata precise. Modify details below or re-decode the VIN using NHTSA databases.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                  {/* VIN Decoder */}
                  <div className="rounded-xl border bg-secondary/10 p-4 space-y-2">
                    <label className="text-xs font-bold text-foreground block">VIN Decoder</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter 17-character VIN"
                        value={editVin}
                        onChange={(e) => setEditVin(e.target.value)}
                        className="h-9 font-mono text-xs uppercase"
                        maxLength={17}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isDecoding || !editVin}
                        onClick={handleDecodeVin}
                        className="h-9 px-3 shrink-0 text-xs"
                      >
                        {isDecoding ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Decode'}
                      </Button>
                    </div>
                    {decodeError && <p className="text-[10px] text-destructive">{decodeError}</p>}
                    {decodeSuccess && <p className="text-[10px] text-emerald-600">NHTSA fields imported!</p>}
                  </div>

                  {/* Manual Fields */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Year *</label>
                      <Input
                        type="number"
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <label className="text-[11px] font-semibold text-muted-foreground">Make *</label>
                      <Input
                        value={editMake}
                        onChange={(e) => setEditMake(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Model *</label>
                      <Input
                        value={editModel}
                        onChange={(e) => setEditModel(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Trim</label>
                      <Input
                        value={editTrim}
                        onChange={(e) => setEditTrim(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Body Style</label>
                    <Input
                      value={editBodyStyle}
                      onChange={(e) => setEditBodyStyle(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Purchase Date</label>
                      <Input
                        type="date"
                        value={editPurchaseDate}
                        onChange={(e) => setEditPurchaseDate(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Purchase Price ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editPurchasePrice}
                        onChange={(e) => setEditPurchasePrice(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Odometer (mi)</label>
                      <Input
                        type="number"
                        value={editCurrentMileage}
                        onChange={(e) => setEditCurrentMileage(e.target.value)}
                        className="h-9 text-xs"
                      />
                    </div>
                    <div className="flex items-center h-9">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editIsPrimary}
                          onChange={(e) => setEditIsPrimary(e.target.checked)}
                          className="rounded text-primary h-4 w-4"
                        />
                        <span className="text-xs font-semibold">Primary Build</span>
                      </label>
                    </div>
                  </div>

                  {editError && (
                    <div className="text-xs text-destructive bg-destructive/10 border p-2 rounded flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{editError}</span>
                    </div>
                  )}

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" className="text-xs" onClick={() => setIsEditOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isEditSubmitting} className="text-xs">
                      {isEditSubmitting ? 'Saving...' : 'Save Specs'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Button */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs font-semibold h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                <span>Delete</span>
              </Button>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>Confirm Delete Vehicle</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    This action is <strong>permanent</strong>. It will completely delete this vehicle and all associated logs (maintenance, modifications, expenses) from our database.
                  </DialogDescription>
                </DialogHeader>
                {deleteError && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded">{deleteError}</p>}
                <DialogFooter className="sm:justify-end gap-2 pt-2">
                  <Button variant="outline" className="text-xs" disabled={isDeleting} onClick={() => setIsDeleteOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" className="text-xs font-semibold" disabled={isDeleting} onClick={handleDeleteVehicle}>
                    {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Fleet Quick Info Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase">Odometer</CardTitle>
            <Gauge className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {vehicle.current_mileage ? `${vehicle.current_mileage.toLocaleString()} mi` : 'Not logged'}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Active mileage reading</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase">Service Costs</CardTitle>
            <Wrench className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${serviceCostTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{services.length} records completed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase">Mod Investments</CardTitle>
            <Sliders className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${modsCostTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{mods.length} upgrades installed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
            <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${grandTotalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Specs + upkeep + upgrades</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b overflow-x-auto whitespace-nowrap scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all duration-200 border-b-2 ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>Overview & Specs</span>
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all duration-200 border-b-2 ${
            activeTab === 'service'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Wrench className="h-4 w-4" />
          <span>Service Log ({services.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('mods')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all duration-200 border-b-2 ${
            activeTab === 'mods'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Modifications ({mods.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all duration-200 border-b-2 ${
            activeTab === 'expenses'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Fuel & Expenses ({expenses.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Detailed specs table card */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Car className="h-4 w-4 text-primary" />
                    <span>Technical Specifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y text-xs">
                    <div className="grid grid-cols-3 p-4">
                      <span className="font-semibold text-muted-foreground col-span-1">Model Year</span>
                      <span className="font-bold text-foreground col-span-2">{vehicle.year}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="font-semibold text-muted-foreground col-span-1">Make / Brand</span>
                      <span className="font-bold text-foreground col-span-2">{vehicle.make}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="font-semibold text-muted-foreground col-span-1">Model Name</span>
                      <span className="font-bold text-foreground col-span-2">{vehicle.model}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="font-semibold text-muted-foreground col-span-1">Trim Level</span>
                      <span className="font-bold text-foreground col-span-2">{vehicle.trim || 'Not specified'}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="font-semibold text-muted-foreground col-span-1">Body Class</span>
                      <span className="font-bold text-foreground col-span-2">{vehicle.body_style || 'Not specified'}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="font-semibold text-muted-foreground col-span-1">VIN Code</span>
                      <span className="font-mono font-bold text-foreground col-span-2 truncate">{vehicle.vin || 'Not specified'}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="font-semibold text-muted-foreground col-span-1">Purchase Date</span>
                      <span className="font-bold text-foreground col-span-2">{vehicle.purchase_date || 'Not specified'}</span>
                    </div>
                    <div className="grid grid-cols-3 p-4">
                      <span className="font-semibold text-muted-foreground col-span-1">Purchase Cost</span>
                      <span className="font-bold text-foreground col-span-2">
                        {vehicle.purchase_price ? `$${vehicle.purchase_price.toLocaleString()}` : 'Not specified'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Odometer Timeline Progression Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span>Odometer progression</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.length === 0 ? (
                    <div className="text-center py-6 text-xs text-muted-foreground">
                      No odometer timeline logs available yet. Log service records to track progression.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                        <span>Starting (Purchase)</span>
                        <span>Latest Mileage</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden flex">
                        <div className="bg-primary/20 h-full" style={{ width: '30%' }} />
                        <div className="bg-primary h-full transition-all duration-500" style={{ width: '70%' }} />
                      </div>
                      <div className="flex justify-between text-xs font-bold text-foreground font-mono">
                        <span>{vehicle.purchase_price ? 'Registered' : 'N/A'}</span>
                        <span>{vehicle.current_mileage?.toLocaleString() || 'N/A'} mi</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Custom CSS charts cards */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    <span>Investment Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dynamic Stacked horizontal progress bar */}
                  <div className="h-5 bg-secondary rounded-lg overflow-hidden flex shadow-inner">
                    {purchaseCost > 0 && (
                      <div 
                        className="bg-neutral-800 hover:opacity-90 transition-opacity" 
                        style={{ width: `${purchasePercentage}%` }} 
                        title={`Purchase Price: ${purchasePercentage.toFixed(1)}%`}
                      />
                    )}
                    {serviceCostTotal > 0 && (
                      <div 
                        className="bg-amber-500 hover:opacity-90 transition-opacity" 
                        style={{ width: `${servicePercentage}%` }} 
                        title={`Maintenance: ${servicePercentage.toFixed(1)}%`}
                      />
                    )}
                    {modsCostTotal > 0 && (
                      <div 
                        className="bg-violet-500 hover:opacity-90 transition-opacity" 
                        style={{ width: `${modsPercentage}%` }} 
                        title={`Modifications: ${modsPercentage.toFixed(1)}%`}
                      />
                    )}
                    {expensesCostTotal > 0 && (
                      <div 
                        className="bg-blue-500 hover:opacity-90 transition-opacity" 
                        style={{ width: `${expensesPercentage}%` }} 
                        title={`Expenses: ${expensesPercentage.toFixed(1)}%`}
                      />
                    )}
                  </div>

                  {/* Detailed legend list */}
                  <div className="space-y-3 text-xs font-medium">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded bg-neutral-800 shrink-0" />
                        <span>Purchase Price</span>
                      </div>
                      <span className="font-bold text-foreground">${purchaseCost.toLocaleString()} ({purchasePercentage.toFixed(0)}%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded bg-amber-500 shrink-0" />
                        <span>Service & Upkeep</span>
                      </div>
                      <span className="font-bold text-foreground">${serviceCostTotal.toLocaleString()} ({servicePercentage.toFixed(0)}%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded bg-violet-500 shrink-0" />
                        <span>Upgrades & Mods</span>
                      </div>
                      <span className="font-bold text-foreground">${modsCostTotal.toLocaleString()} ({modsPercentage.toFixed(0)}%)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded bg-blue-500 shrink-0" />
                        <span>Expenses</span>
                      </div>
                      <span className="font-bold text-foreground">${expensesCostTotal.toLocaleString()} ({expensesPercentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* SERVICE LOG TAB */}
        {activeTab === 'service' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold tracking-tight">Upkeep & Service Log</h3>
              
              {/* Quick Add Service Modal */}
              <Dialog open={isAddServiceOpen} onOpenChange={(open) => {
                setIsAddServiceOpen(open)
                if (!open) setLogError(null)
              }}>
                <DialogTrigger render={
                  <Button className="flex items-center gap-1 shadow-sm text-xs font-semibold h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Quick Log Service</span>
                  </Button>
                } />

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">Log Maintenance Service</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Record repairs, replacement items, or fluid upgrades.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddServiceSubmit} className="space-y-4 mt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Service Date *</label>
                        <Input type="date" name="service_date" defaultValue={new Date().toISOString().split('T')[0]} required className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Odometer reading (mi) *</label>
                        <Input type="number" name="mileage" placeholder="e.g. 124200" required className="h-9 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Service Type *</label>
                      <Input type="text" name="service_type" placeholder="e.g. Oil Change & Filter" required className="h-9 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Total Cost ($) *</label>
                        <Input type="number" step="0.01" name="cost" placeholder="e.g. 45" className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Shop / Mechanic Name</label>
                        <Input type="text" name="shop_name" placeholder="e.g. Local Garage or DIY" className="h-9 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Notes / Description</label>
                      <Input type="text" name="description" placeholder="e.g. Mobil1 10W-30 Synthetic oil with OEM filter" className="h-9 text-xs" />
                    </div>

                    {logError && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded">{logError}</p>}

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" className="text-xs h-9" onClick={() => setIsAddServiceOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLogSubmitting} className="text-xs h-9">
                        {isLogSubmitting ? 'Logging...' : 'Log Record'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingLogs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : services.length === 0 ? (
              <Card className="border-dashed py-10 flex flex-col items-center justify-center p-6 text-center">
                <Wrench className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="text-sm font-bold">No Maintenance Logged Yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Keep your digital logbook pristine. Log services like alignments, filters, or brakes to track history.
                </p>
              </Card>
            ) : (
              <div className="divide-y border rounded-xl bg-card overflow-hidden">
                {services.map((service) => (
                  <div key={service.id} className="p-4 flex justify-between items-start text-xs sm:p-5">
                    <div className="space-y-1.5 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{service.service_type}</span>
                        {service.shop_name && (
                          <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                            {service.shop_name}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">{service.description || 'No additional description provided.'}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[11px] font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{service.service_date}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge className="h-3.5 w-3.5" />
                          <span>{service.mileage.toLocaleString()} mi</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-bold text-sm text-foreground shrink-0 pt-1">
                      ${service.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODS TAB */}
        {activeTab === 'mods' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold tracking-tight">Performance Parts & Upgrades</h3>
              
              {/* Quick Add Mod Modal */}
              <Dialog open={isAddModOpen} onOpenChange={(open) => {
                setIsAddModOpen(open)
                if (!open) setLogError(null)
              }}>
                <DialogTrigger render={
                  <Button className="flex items-center gap-1 shadow-sm text-xs font-semibold h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Quick Add Mod</span>
                  </Button>
                } />

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">Register Custom Modification</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Keep track of installed performance items, wheels, exterior upgrades, or interior modifications.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddModSubmit} className="space-y-4 mt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Install Date *</label>
                        <Input type="date" name="install_date" defaultValue={new Date().toISOString().split('T')[0]} required className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Component Brand</label>
                        <Input type="text" name="brand" placeholder="e.g. Koni or HKS" className="h-9 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Part Name *</label>
                      <Input type="text" name="part_name" placeholder="e.g. Yellow Adjustable Shocks" required className="h-9 text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Upgrades Cost ($)</label>
                        <Input type="number" step="0.01" name="cost" placeholder="e.g. 650" className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Mod Category</label>
                        <Input type="text" name="category" placeholder="e.g. Suspension, Exhaust, Interior" className="h-9 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Performance Notes</label>
                      <Input type="text" name="notes" placeholder="e.g. Coilovers aligned at -1.5 camber." className="h-9 text-xs" />
                    </div>

                    {logError && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded">{logError}</p>}

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" className="text-xs h-9" onClick={() => setIsAddModOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLogSubmitting} className="text-xs h-9">
                        {isLogSubmitting ? 'Adding...' : 'Register Upgrade'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingLogs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : mods.length === 0 ? (
              <Card className="border-dashed py-10 flex flex-col items-center justify-center p-6 text-center">
                <Sliders className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="text-sm font-bold">No Modifications Registered</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Did you install coilovers, intake manifolds, or custom wheels? Log your parts list to compile your dynamic enthusiast build sheet!
                </p>
              </Card>
            ) : (
              <div className="divide-y border rounded-xl bg-card overflow-hidden">
                {mods.map((mod) => (
                  <div key={mod.id} className="p-4 flex justify-between items-start text-xs sm:p-5">
                    <div className="space-y-1.5 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{mod.part_name}</span>
                        {mod.category && (
                          <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                            {mod.category}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">{mod.notes || 'No notes provided.'}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[11px] font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{mod.install_date}</span>
                        </span>
                        {mod.brand && (
                          <span>Brand: <strong className="text-foreground">{mod.brand}</strong></span>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-bold text-sm text-foreground shrink-0 pt-1">
                      ${mod.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold tracking-tight">Odometer Fuel Fill-ups & Upkeep Expenses</h3>
              
              {/* Quick Add Expense Modal */}
              <Dialog open={isAddExpenseOpen} onOpenChange={(open) => {
                setIsAddExpenseOpen(open)
                if (!open) setLogError(null)
              }}>
                <DialogTrigger render={
                  <Button className="flex items-center gap-1 shadow-sm text-xs font-semibold h-8">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Quick Log Expense</span>
                  </Button>
                } />

                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-base font-bold">Register Fuel / Upkeep Expense</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      Track insurance costs, premium fuel fill-ups, registration payments, and parking.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleAddExpenseSubmit} className="space-y-4 mt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Expense Date *</label>
                        <Input type="date" name="expense_date" defaultValue={new Date().toISOString().split('T')[0]} required className="h-9 text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Expense Category *</label>
                        <select name="category" required className="w-full h-9 rounded-lg border bg-background text-xs px-2 font-medium">
                          <option value="Fuel">Premium Fuel</option>
                          <option value="Insurance">Insurance</option>
                          <option value="Registration">Registration</option>
                          <option value="Other">Other Upkeep Cost</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Receipt Amount ($) *</label>
                        <Input type="number" step="0.01" name="amount" placeholder="e.g. 42.50" required className="h-9 text-xs font-semibold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Odometer reading (Optional)</label>
                        <Input type="number" name="mileage" placeholder="e.g. 124190" className="h-9 text-xs" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Cost Notes / Retailer</label>
                      <Input type="text" name="description" placeholder="e.g. Shell Premium 93 Octane - 10.2 Gallons" className="h-9 text-xs" />
                    </div>

                    {logError && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded">{logError}</p>}

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" className="text-xs h-9" onClick={() => setIsAddExpenseOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLogSubmitting} className="text-xs h-9">
                        {isLogSubmitting ? 'Logging...' : 'Log Expense'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingLogs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : expenses.length === 0 ? (
              <Card className="border-dashed py-10 flex flex-col items-center justify-center p-6 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="text-sm font-bold">No Expenses Logged Yet</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Log premium gas purchases, registration renewals, insurance, and repairs to track exactly what it costs to keep your vehicle running smoothly!
                </p>
              </Card>
            ) : (
              <div className="divide-y border rounded-xl bg-card overflow-hidden">
                {expenses.map((expense) => (
                  <div key={expense.id} className="p-4 flex justify-between items-start text-xs sm:p-5">
                    <div className="space-y-1.5 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{expense.category} Expense</span>
                        {expense.mileage && (
                          <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                            {expense.mileage.toLocaleString()} mi
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground">{expense.description || 'No additional details provided.'}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[11px] font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{expense.expense_date}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-bold text-sm text-foreground shrink-0 pt-1">
                      ${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
