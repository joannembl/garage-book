import React from 'react'
import { getVehicleById } from '@/app/actions/vehicles'
import { getCurrentUser } from '@/app/actions/auth'
import { VehicleDetailClient } from '@/components/vehicles/vehicle-detail-client'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Car } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const { id } = await params
  const vehicle = await getVehicleById(id)
  const user = await getCurrentUser()

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-4">
        <div className="h-14 w-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <Car className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">Vehicle Not Found</h2>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6">
          The vehicle you are trying to view does not exist or you do not have permission to access it.
        </p>
        <Link href="/" className={buttonVariants({ size: 'sm', variant: 'default' })}>
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          <span>Back to Garage</span>
        </Link>
      </div>
    )
  }

  const isPro = user?.is_pro || false

  return (
    <div className="space-y-6">
      {/* Breadcrumb back */}
      <div className="flex items-center">
        <Link 
          href="/" 
          className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Garage</span>
        </Link>
      </div>

      <VehicleDetailClient vehicle={vehicle} isPro={isPro} />
    </div>
  )
}
