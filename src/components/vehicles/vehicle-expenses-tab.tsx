'use client'

import React, { useState } from 'react'
import { Plus, Receipt, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import type { ExpenseRecord } from '@/app/actions/vehicles'

interface ExpensesTabProps {
  expenses: ExpenseRecord[]
  isLoading: boolean
  onAddExpense: (formData: FormData) => Promise<void>
}

export function ExpensesTab({ expenses, isLoading, onAddExpense }: ExpensesTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    try {
      await onAddExpense(formData)
      setIsAddOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold tracking-tight">Fuel & Upkeep Expenses</h3>
        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setError(null) }}>
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
            <form onSubmit={handleSubmit} className="space-y-4 mt-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Expense Date *</label>
                  <Input type="date" name="expense_date" defaultValue={new Date().toISOString().split('T')[0]} required className="h-9 text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Category *</label>
                  <select name="category" required className="w-full h-9 rounded-lg border bg-background text-xs px-2 font-medium">
                    <option value="Fuel">Premium Fuel</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Registration">Registration</option>
                    <option value="Other">Other Upkeep Cost</option>
                    <option value="Parking">Parking / Tolls</option>
                    <option value="Tires">Tires</option>
                    <option value="Detailing">Detailing / Cleaning</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Amount ($) *</label>
                  <Input type="number" step="0.01" name="amount" placeholder="e.g. 42.50" required className="h-9 text-xs font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Odometer (Optional)</label>
                  <Input type="number" name="mileage" placeholder="e.g. 124190" className="h-9 text-xs" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Notes / Retailer</label>
                <Input type="text" name="description" placeholder="e.g. Shell Premium 93 - 10.2 Gallons" className="h-9 text-xs" />
              </div>
              {error && <p className="text-xs text-destructive bg-destructive/5 p-2 rounded flex items-center gap-1"><AlertCircle className="h-3 w-3" />{error}</p>}
              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" className="text-xs h-9" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="text-xs h-9">{isSubmitting ? 'Logging...' : 'Log Expense'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : expenses.length === 0 ? (
        <Card className="border-dashed py-10 flex flex-col items-center justify-center p-6 text-center">
          <Receipt className="h-8 w-8 text-muted-foreground mb-2" />
          <h4 className="text-sm font-bold">No Expenses Logged Yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">Log premium gas, registrations, insurance, and repairs to track running costs.</p>
        </Card>
      ) : (
        <div className="divide-y border rounded-xl bg-card overflow-hidden">
          {expenses.map((expense) => (
            <div key={expense.id} className="p-4 flex justify-between items-start text-xs sm:p-5">
              <div className="space-y-1.5 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{expense.category}</span>
                  {expense.mileage && (
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium">{expense.mileage.toLocaleString()} mi</span>
                  )}
                </div>
                <p className="text-muted-foreground">{expense.description || 'No additional details provided.'}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-[11px] font-medium pt-1">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /><span>{expense.expense_date}</span></span>
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
  )
}