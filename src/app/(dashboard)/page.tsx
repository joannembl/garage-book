import React from 'react'
import {
  Car,
  Wrench,
  Sliders,
  Receipt,
  Plus,
  DollarSign,
  Activity,
  ArrowRight,
  Shield,
  Calendar,
  Gauge,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  // Sample data to make the dashboard look rich and complete
  const sampleVehicle = {
    id: '1',
    year: 1994,
    make: 'Mazda',
    model: 'Miata MX-5',
    trim: 'R-Package',
    bodyStyle: 'Convertible',
    vin: 'JM1NA351*R0******',
    purchaseDate: '2024-03-15',
    purchasePrice: 6500,
    currentMileage: 124200,
    isPrimary: true,
  }

  const recentActivities = [
    {
      id: 'a1',
      type: 'maintenance',
      title: 'Oil Change & Filter',
      date: '2026-06-10',
      description: 'Mobil1 10W-30 Synthetic oil with OEM filter',
      cost: 45.00,
    },
    {
      id: 'a2',
      type: 'modification',
      title: 'Koni Yellow Shocks Installed',
      date: '2026-05-28',
      description: 'Paired with Flyin\' Miata lowering springs',
      cost: 650.00,
    },
    {
      id: 'a3',
      type: 'expense',
      title: 'Premium Fuel Fill-up',
      date: '2026-06-14',
      description: '93 Octane Shell V-Power - 10.2 gallons',
      cost: 42.50,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-card border p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Enthusiast! 🏎️</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Here is what is happening with your fleet today. Keep your digital history immaculate.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-1.5 shadow-sm text-xs font-semibold">
            <Plus className="h-4 w-4" />
            <span>Add Vehicle</span>
          </Button>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicles</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Car className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active enthusiast build
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Invested</CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7,237.50</div>
            <p className="text-xs text-muted-foreground mt-1">
              Purchase + maintenance + mods
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Modifications</CardTitle>
            <div className="h-8 w-8 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500">
              <Sliders className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">
              Performance part installed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service Quality</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Shield className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground mt-1">
              History verified & logged
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Vehicle and Recent Logs Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Fleet/Primary Vehicle Card */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              <span>Your Garage</span>
            </h3>
            <span className="text-xs text-muted-foreground font-medium">1 of 1 free slots used</span>
          </div>

          <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Beautiful gradient banner */}
            <div className="h-32 bg-gradient-to-r from-neutral-800 to-neutral-950 p-6 flex flex-col justify-end text-white relative">
              <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full uppercase shadow-sm">
                Primary Build
              </span>
              <h4 className="text-2xl font-extrabold tracking-tight">
                {sampleVehicle.year} {sampleVehicle.make} {sampleVehicle.model}
              </h4>
              <p className="text-xs text-neutral-300 font-medium mt-1">
                {sampleVehicle.trim} • {sampleVehicle.bodyStyle}
              </p>
            </div>

            <CardContent className="p-6">
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <div className="flex flex-col gap-1 border-r pr-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="h-3.5 w-3.5" />
                    <span>Odometer</span>
                  </span>
                  <span className="text-sm font-bold tracking-tight">
                    {sampleVehicle.currentMileage.toLocaleString()} mi
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-r pr-2 pl-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Purchased</span>
                  </span>
                  <span className="text-sm font-bold tracking-tight">
                    {sampleVehicle.purchaseDate}
                  </span>
                </div>

                <div className="flex flex-col gap-1 border-r pr-2 pl-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>Cost</span>
                  </span>
                  <span className="text-sm font-bold tracking-tight">
                    ${sampleVehicle.purchasePrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-col gap-1 pl-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    <span>VIN</span>
                  </span>
                  <span className="text-xs font-mono font-bold truncate">
                    {sampleVehicle.vin}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t bg-secondary/10 px-6 py-4 flex flex-wrap gap-2 justify-between items-center shrink-0">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs font-semibold h-8 flex items-center gap-1">
                  <Wrench className="h-3.5 w-3.5" />
                  <span>Log Service</span>
                </Button>
                <Button size="sm" variant="outline" className="text-xs font-semibold h-8 flex items-center gap-1">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Add Mod</span>
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="text-xs font-semibold h-8 flex items-center gap-1 text-primary hover:bg-secondary/40">
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Recent Activity Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span>Recent Activity</span>
          </h3>

          <Card className="shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-card ${
                              activity.type === 'maintenance' ? 'bg-amber-500/10 text-amber-500' :
                              activity.type === 'modification' ? 'bg-violet-500/10 text-violet-500' :
                              'bg-blue-500/10 text-blue-500'
                            }`}>
                              {activity.type === 'maintenance' ? <Wrench className="h-4 w-4" /> :
                               activity.type === 'modification' ? <Sliders className="h-4 w-4" /> :
                               <Receipt className="h-4 w-4" />
                              }
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <div className="flex justify-between items-start gap-1">
                              <p className="text-sm font-bold text-foreground">
                                {activity.title}
                              </p>
                              <span className="text-xs font-bold text-foreground">
                                ${activity.cost.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {activity.description}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-medium mt-1 block">
                              {activity.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
