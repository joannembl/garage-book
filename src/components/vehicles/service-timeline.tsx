'use client'

import React from 'react'
import { Calendar, Gauge, Receipt, Upload } from 'lucide-react'

interface ServiceRecordItem {
  id: string
  service_date: string
  mileage: number
  service_type: string
  description: string | null
  cost: number
  shop_name: string | null
  receipt_url: string | null
}

interface ServiceTimelineProps {
  services: ServiceRecordItem[]
  onViewReceipt: (url: string) => void
}

export function ServiceTimeline({ services, onViewReceipt }: ServiceTimelineProps) {
  if (services.length === 0) return null

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {services.map((service, idx) => (
          <li key={service.id}>
            <div className="relative pb-8">
              {idx !== services.length - 1 && (
                <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
              )}
              <div className="relative flex space-x-4">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center ring-8 ring-card shrink-0">
                  <Receipt className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{service.service_type}</p>
                      {service.shop_name && (
                        <span className="text-[11px] text-muted-foreground font-medium">{service.shop_name}</span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">
                      ${service.cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {service.description && (
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{service.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{service.service_date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3.5 w-3.5" />
                      <span>{service.mileage.toLocaleString()} mi</span>
                    </span>
                    {service.receipt_url && (
                      <button
                        onClick={() => onViewReceipt(service.receipt_url!)}
                        className="flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span>View Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface ReceiptUploadProps {
  onFileSelect: (dataUrl: string) => void
  currentValue?: string
}

export function ReceiptUpload({ onFileSelect, currentValue }: ReceiptUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      onFileSelect(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-secondary/10 hover:bg-secondary/20 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
      >
        {currentValue ? (
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Receipt className="h-4 w-4 text-primary" />
            <span>Receipt attached</span>
          </div>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">Tap to upload receipt photo</span>
          </>
        )}
      </button>
    </div>
  )
}