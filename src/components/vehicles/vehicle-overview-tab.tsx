'use client'

import React from 'react'
import { Car, TrendingUp, PieChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { VehicleData, ServiceRecord, ModificationRecord, ExpenseRecord } from '@/app/actions/vehicles'

interface OverviewTabProps {
  vehicle: VehicleData
  services: ServiceRecord[]
  mods: ModificationRecord[]
  expenses: ExpenseRecord[]
}

export function OverviewTab({ vehicle, services, mods, expenses }: OverviewTabProps) {
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
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        {/* Tech Specs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Car className="h-4 w-4 text-primary" />
              <span>Technical Specifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y text-xs">
              <SpecRow label="Model Year" value={vehicle.year.toString()} />
              <SpecRow label="Make / Brand" value={vehicle.make} />
              <SpecRow label="Model Name" value={vehicle.model} />
              <SpecRow label="Trim Level" value={vehicle.trim || 'Not specified'} />
              <SpecRow label="Body Class" value={vehicle.body_style || 'Not specified'} />
              <SpecRow label="VIN Code" value={vehicle.vin || 'Not specified'} mono />
              <SpecRow label="Purchase Date" value={vehicle.purchase_date || 'Not specified'} />
              <SpecRow label="Purchase Cost" value={vehicle.purchase_price ? `$${vehicle.purchase_price.toLocaleString()}` : 'Not specified'} />
            </div>
          </CardContent>
        </Card>

        {/* Odometer Progression */}
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

      {/* Investment Distribution */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <span>Investment Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-5 bg-secondary rounded-lg overflow-hidden flex shadow-inner">
              {purchaseCost > 0 && (
                <div className="bg-neutral-800 hover:opacity-90 transition-opacity" style={{ width: `${purchasePercentage}%` }} />
              )}
              {serviceCostTotal > 0 && (
                <div className="bg-amber-500 hover:opacity-90 transition-opacity" style={{ width: `${servicePercentage}%` }} />
              )}
              {modsCostTotal > 0 && (
                <div className="bg-violet-500 hover:opacity-90 transition-opacity" style={{ width: `${modsPercentage}%` }} />
              )}
              {expensesCostTotal > 0 && (
                <div className="bg-blue-500 hover:opacity-90 transition-opacity" style={{ width: `${expensesPercentage}%` }} />
              )}
            </div>

            <div className="space-y-3 text-xs font-medium">
              <LegendItem color="bg-neutral-800" label="Purchase Price" value={`$${purchaseCost.toLocaleString()} (${purchasePercentage.toFixed(0)}%)`} />
              <LegendItem color="bg-amber-500" label="Service & Upkeep" value={`$${serviceCostTotal.toLocaleString()} (${servicePercentage.toFixed(0)}%)`} />
              <LegendItem color="bg-violet-500" label="Upgrades & Mods" value={`$${modsCostTotal.toLocaleString()} (${modsPercentage.toFixed(0)}%)`} />
              <LegendItem color="bg-blue-500" label="Expenses" value={`$${expensesCostTotal.toLocaleString()} (${expensesPercentage.toFixed(0)}%)`} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SpecRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="grid grid-cols-3 p-4">
      <span className="font-semibold text-muted-foreground col-span-1">{label}</span>
      <span className={`font-bold text-foreground col-span-2 ${mono ? 'font-mono truncate' : ''}`}>{value}</span>
    </div>
  )
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-3 w-3 rounded ${color} shrink-0`} />
        <span>{label}</span>
      </div>
      <span className="font-bold text-foreground">{value}</span>
    </div>
  )
}