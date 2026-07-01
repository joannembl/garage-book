'use client'

import React, { useState } from 'react'
import { Plus, Sliders, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import type { ModificationRecord } from '@/app/actions/vehicles'

interface ModsTabProps {
  mods: ModificationRecord[]
  isLoading: boolean
  onAddMod: (formData: FormData) => Promise<void>
}

export function ModsTab({ mods, isLoading, onAddMod }: ModsTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    try {
      await onAddMod(formData)
      setIsAddOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add modification.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold tracking-tight">Performance Parts & Upgrades</h3>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setError(null) }}>
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
            <form onSubmit={handleSubmit} className="space-y-4 mt-1">
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
                  <label className="text-[11px] font-semibold text-muted-foreground">Upgrade Cost ($)</label>
                  <Input type="number" step="0.01" name="cost" placeholder="e.g. 650" className="h-9 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Mod Category</label>
                  <Input type="text" name="category" placeholder="e.g. Suspension, Exhaust" className="h-9 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Performance Notes</label>
                <Input type="text" name="notes" placeholder="e.g. Coilovers aligned at -1.5 camber." className="h-9 text-xs" />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" className="text-xs h-9" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="text-xs h-9">{isSubmitting ? 'Adding...' : 'Register Upgrade'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : mods.length === 0 ? (
        <Card className="border-dashed py-10 flex flex-col items-center justify-center p-6 text-center">
          <Sliders className="h-8 w-8 text-muted-foreground mb-2" />
          <h4 className="text-sm font-bold">No Modifications Registered</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">Log your parts to compile your dynamic enthusiast build sheet!</p>
        </Card>
      ) : (
        <div className="divide-y border rounded-xl bg-card overflow-hidden">
          {mods.map((mod) => (
            <div key={mod.id} className="p-4 flex justify-between items-start text-xs sm:p-5">
              <div className="space-y-1.5 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{mod.part_name}</span>
                  {mod.category && <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">{mod.category}</span>}
                </div>
                <p className="text-muted-foreground">{mod.notes || 'No notes provided.'}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[11px] font-medium pt-1">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /><span>{mod.install_date}</span></span>
                  {mod.brand && <span>Brand: <strong className="text-foreground">{mod.brand}</strong></span>}
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
  )
}