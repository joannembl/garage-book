'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { decodeVin, createVehicle } from '@/app/actions/vehicles'
import { Loader2, Plus, Search, Sparkles, AlertCircle, Check } from 'lucide-react'

interface AddVehicleDialogProps {
  isPro: boolean
  hasVehiclesCount: number
}

export function AddVehicleDialog({ isPro, hasVehiclesCount }: AddVehicleDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  
  // VIN state
  const [vinInput, setVinInput] = useState('')
  const [isDecoding, setIsDecoding] = useState(false)
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [decodeSuccess, setDecodeSuccess] = useState(false)

  // Form states
  const [year, setYear] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [trim, setTrim] = useState('')
  const [bodyStyle, setBodyStyle] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [currentMileage, setCurrentMileage] = useState('')
  const [isPrimary, setIsPrimary] = useState(false)

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const isFreeTierLimited = !isPro && hasVehiclesCount >= 1

  const handleDecodeVin = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!vinInput || vinInput.trim().length < 8) {
      setDecodeError('Please enter at least 8 characters of a valid VIN.')
      setDecodeSuccess(false)
      return
    }

    setIsDecoding(true)
    setDecodeError(null)
    setDecodeSuccess(false)

    try {
      const result = await decodeVin(vinInput)
      if (result.error) {
        setDecodeError(result.error)
      } else if (result.success && result.data) {
        const d = result.data
        if (d.year) setYear(d.year.toString())
        if (d.make) setMake(d.make)
        if (d.model) setModel(d.model)
        if (d.trim) setTrim(d.trim)
        if (d.bodyStyle) setBodyStyle(d.bodyStyle)
        setDecodeSuccess(true)
      }
    } catch {
      setDecodeError('Failed to decode VIN. Please enter details manually.')
    } finally {
      setIsDecoding(false)
    }
  }

  const resetForm = () => {
    setVinInput('')
    setYear('')
    setMake('')
    setModel('')
    setTrim('')
    setBodyStyle('')
    setPurchaseDate('')
    setPurchasePrice('')
    setCurrentMileage('')
    setIsPrimary(false)
    setDecodeError(null)
    setDecodeSuccess(false)
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isFreeTierLimited) {
      setSubmitError('Free Tier is limited to 1 vehicle. Please upgrade to Pro on your Profile settings.')
      return
    }

    if (!year || !make || !model) {
      setSubmitError('Year, Make, and Model are required fields.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const formData = new FormData()
    formData.append('year', year)
    formData.append('make', make)
    formData.append('model', model)
    formData.append('trim', trim)
    formData.append('body_style', bodyStyle)
    formData.append('vin', vinInput)
    formData.append('purchase_date', purchaseDate)
    formData.append('purchase_price', purchasePrice)
    formData.append('current_mileage', currentMileage)
    formData.append('is_primary', isPrimary ? 'true' : 'false')

    try {
      const result = await createVehicle(formData)
      if (result.error) {
        setSubmitError(result.error)
      } else {
        setIsOpen(false)
        resetForm()
        router.refresh()
      }
    } catch {
      setSubmitError('An unexpected error occurred while saving the vehicle.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) resetForm()
    }}>
      <DialogTrigger render={
        <Button className="flex items-center gap-1.5 shadow-sm text-xs font-semibold">
          <Plus className="h-4 w-4" />
          <span>Add Vehicle</span>
        </Button>
      } />

      <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <span>Add Vehicle to Garage</span>
            {!isPro && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-normal">Free Version</span>}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Document your enthusiast car or project vehicle. Enter a VIN to auto-decode, or fill details manually.
          </DialogDescription>
        </DialogHeader>

        {isFreeTierLimited ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-700 space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Free Account Vehicle Limit Reached</p>
                <p className="mt-1">
                  You are currently on the Free plan, which allows tracking of <strong>1 vehicle</strong>. You already have a vehicle registered.
                </p>
              </div>
            </div>
            <Button 
              type="button"
              variant="outline"
              className="w-full text-xs font-semibold border-amber-500/30 hover:bg-amber-500/10 text-amber-700"
              onClick={() => {
                setIsOpen(false)
                router.push('/profile')
              }}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-600 fill-amber-600/20 animate-pulse" />
              <span>Upgrade to Pro ($39/yr)</span>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-2">
            {/* VIN Decoding Segment */}
            <div className="rounded-xl border bg-secondary/20 p-4 space-y-3">
              <label className="text-xs font-bold text-foreground block">
                NHTSA VIN Decoder (Optional)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter 17-character VIN"
                    value={vinInput}
                    onChange={(e) => setVinInput(e.target.value)}
                    className="h-9 pr-8 font-mono text-xs uppercase"
                    maxLength={17}
                  />
                  {decodeSuccess && (
                    <div className="absolute right-2.5 top-2 text-emerald-500">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9 px-3 text-xs font-semibold shrink-0"
                  disabled={isDecoding || !vinInput}
                  onClick={handleDecodeVin}
                >
                  {isDecoding ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <>
                      <Search className="h-3.5 w-3.5 mr-1" />
                      <span>Decode</span>
                    </>
                  )}
                </Button>
              </div>
              {decodeError && (
                <p className="text-[11px] text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{decodeError}</span>
                </p>
              )}
              {decodeSuccess && (
                <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                  <Check className="h-3 w-3 shrink-0" />
                  <span>NHTSA decoded successfully! Core details populated below.</span>
                </p>
              )}
            </div>

            {/* Core Vehicle Specifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Vehicle Specifications</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Year *</label>
                  <Input
                    type="number"
                    placeholder="e.g. 1994"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-9 text-xs font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[11px] font-semibold text-muted-foreground">Make *</label>
                  <Input
                    placeholder="e.g. Mazda"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="h-9 text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Model *</label>
                  <Input
                    placeholder="e.g. Miata MX-5"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="h-9 text-xs font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Trim / Edition</label>
                  <Input
                    placeholder="e.g. R-Package"
                    value={trim}
                    onChange={(e) => setTrim(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Body Style / Class</label>
                <Input
                  placeholder="e.g. Convertible or Hatchback"
                  value={bodyStyle}
                  onChange={(e) => setBodyStyle(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Purchase & Status Information */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Purchase & Status</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Purchase Date</label>
                  <Input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Purchase Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 6500"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="h-9 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Current Mileage (mi)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 124200"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(e.target.value)}
                    className="h-9 text-xs font-semibold"
                  />
                </div>
                
                <div className="flex items-center h-9 px-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPrimary}
                      onChange={(e) => setIsPrimary(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-foreground">Set as Primary Build</span>
                  </label>
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-xs font-semibold h-9"
                disabled={isSubmitting}
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="text-xs font-semibold h-9 min-w-[100px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Add Vehicle</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
