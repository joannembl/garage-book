'use client'

import React, { useState } from 'react'
import { Plus, Wrench, Calendar, Gauge, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { ServiceTimeline, ReceiptUpload } from '@/components/vehicles/service-timeline'
import { PhotoLightbox } from '@/components/vehicles/photo-lightbox'
import type { ServiceRecord } from '@/app/actions/vehicles'

interface ServiceTabProps {
  services: ServiceRecord[]
  isLoading: boolean
  onAddService: (formData: FormData) => Promise<void>
}

export function ServiceTab({ services, isLoading, onAddService }: ServiceTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [receiptData, setReceiptData] = useState<string>('')
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    if (receiptData) {
      formData.append('receipt_data', receiptData)
    }
    try {
      await onAddService(formData)
      setIsAddOpen(false)
      setReceiptData('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Photo Lightbox */}
      <PhotoLightbox
        src={lightboxSrc || ''}
        alt="Receipt preview"
        isOpen={!!lightboxSrc}
        onClose={() => setLightboxSrc(null)}
      />

      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold tracking-tight">Upkeep & Service Log</h3>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) { setError(null); setReceiptData('') } }}>
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
                Record repairs, replacement items, or fluid upgrades. Optionally attach a receipt photo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Service Date *</label>
                  <Input type="date" name="service_date" defaultValue={new Date().toISOString().split('T')[0]} required className="h-9 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Odometer (mi) *</label>
                  <Input type="number" name="mileage" placeholder="e.g. 124200" required className="h-9 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Service Type *</label>
                <Input type="text" name="service_type" placeholder="e.g. Oil Change & Filter" required className="h-9 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Total Cost ($)</label>
                  <Input type="number" step="0.01" name="cost" placeholder="e.g. 45" className="h-9 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Shop / Mechanic</label>
                  <Input type="text" name="shop_name" placeholder="e.g. Local Garage" className="h-9 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Notes / Description</label>
                <Input type="text" name="description" placeholder="e.g. Mobil1 10W-30 Synthetic" className="h-9 text-xs" />
              </div>
              {/* Receipt Upload */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Receipt Photo (Optional)</label>
                <ReceiptUpload onFileSelect={(dataUrl) => setReceiptData(dataUrl)} currentValue={receiptData} />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" className="text-xs h-9" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="text-xs h-9">{isSubmitting ? 'Logging...' : 'Log Record'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : services.length === 0 ? (
        <Card className="border-dashed py-10 flex flex-col items-center justify-center p-6 text-center">
          <Wrench className="h-8 w-8 text-muted-foreground mb-2" />
          <h4 className="text-sm font-bold">No Maintenance Logged Yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">Keep your digital logbook pristine. Log services and attach receipts to track history.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Timeline View */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <ServiceTimeline services={services} onViewReceipt={(url) => setLightboxSrc(url)} />
            </CardContent>
          </Card>

          {/* Compact List View */}
          <details className="group">
            <summary className="text-xs font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none py-2">
              <span className="group-open:hidden">▶ Show compact list view</span>
              <span className="hidden group-open:inline">▼ Hide compact list view</span>
            </summary>
            <div className="divide-y border rounded-xl bg-card overflow-hidden mt-2">
              {services.map((service) => (
                <div key={service.id} className="p-4 flex justify-between items-start text-xs sm:p-5">
                  <div className="space-y-1.5 min-w-0 pr-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">{service.service_type}</span>
                      {service.shop_name && (
                        <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">{service.shop_name}</span>
                      )}
                      {service.receipt_url && (
                        <button
                          onClick={() => setLightboxSrc(service.receipt_url!)}
                          className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                        >
                          📎 Receipt
                        </button>
                      )}
                    </div>
                    <p className="text-muted-foreground">{service.description || 'No additional description provided.'}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[11px] font-medium pt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /><span>{service.service_date}</span></span>
                      <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" /><span>{service.mileage.toLocaleString()} mi</span></span>
                    </div>
                  </div>
                  <div className="text-right font-bold text-sm text-foreground shrink-0 pt-1">
                    ${service.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}