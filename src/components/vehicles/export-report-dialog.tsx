'use client'

import React, { useState, useCallback } from 'react'
import { FileDown, FileText, FileSpreadsheet, Loader2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ReportData } from '@/app/actions/reports'

interface ExportReportDialogProps {
  isPro: boolean
  /** Pass null when still loading, the component handles showing a loading state */
  reportData: ReportData | null | undefined
  onGenerateReport: () => Promise<void>
}

export function ExportReportDialog({
  isPro,
  reportData,
  onGenerateReport,
}: ExportReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isOpening, setIsOpening] = useState(false)

  const handleOpen = useCallback(async () => {
    setIsOpening(true)
    setOpen(true)
    await onGenerateReport()
    setIsOpening(false)
  }, [onGenerateReport])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="text-xs font-semibold h-9 border-primary/30 text-primary hover:bg-primary/10"
        onClick={handleOpen}
        type="button"
      >
        <FileDown className="h-3.5 w-3.5 mr-1" />
        <span>Export Report</span>
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Export Ownership History
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Download a professional report of your vehicle&apos;s complete
            ownership history.
          </DialogDescription>
        </DialogHeader>

        {!isPro ? (
          <div className="space-y-4 py-2">
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">Pro Feature</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upgrade to GarageBook Pro ($39/year) to unlock professional
                    PDF reports and Excel exports.
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs font-bold w-full"
                  onClick={() => window.open('/profile', '_self')}
                >
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : isOpening || !reportData ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading report data…
            </p>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">
                {reportData.vehicle.year} {reportData.vehicle.make}{' '}
                {reportData.vehicle.model}
              </strong>
              {' · '}
              {reportData.totals.service_count} services,{' '}
              {reportData.totals.mod_count} modifications,{' '}
              {reportData.totals.expense_count} expense entries
              {' · '}${reportData.totals.grand_total.toLocaleString()} total invested
            </p>

            <div className="grid gap-2">
              <ExportCard
                icon={<FileText className="h-5 w-5 text-primary" />}
                title="PDF Report"
                description="Professional ownership summary with Midnight Carbon branding"
                actionLabel="Generate PDF"
                onExport={() => exportPdf(reportData)}
              />
              <ExportCard
                icon={<FileSpreadsheet className="h-5 w-5 text-emerald-500" />}
                title="Excel Spreadsheet"
                description="Raw data export with multiple sheets for each category"
                actionLabel="Export Excel"
                onExport={() => exportExcel(reportData)}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ===== Small card for each export format =====

function ExportCard({
  icon,
  title,
  description,
  actionLabel,
  onExport,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel: string
  onExport: () => void
}) {
  const [busy, setBusy] = useState(false)

  const handleClick = async () => {
    setBusy(true)
    try {
      await onExport()
    } catch (e) {
      console.error('Export failed:', e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card className="border hover:border-primary/40 transition-colors cursor-pointer">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-9 w-9 rounded-lg bg-secondary/30 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">{title}</p>
          <p className="text-[11px] text-muted-foreground truncate">
            {description}
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="text-xs font-semibold shrink-0"
          disabled={busy}
          onClick={handleClick}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            actionLabel
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// ============================================================
// PDF GENERATION
// ============================================================

async function exportPdf(data: ReportData) {
  // Dynamic import so we don't block initial bundle
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const doc = new jsPDF('p', 'mm', 'a4')
  const pageW = 210
  const margin = 14
  const contentW = pageW - margin * 2
  const red: [number, number, number] = [204, 44, 44]
  const dark: [number, number, number] = [28, 30, 36]
  const gray: [number, number, number] = [120, 120, 130]

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const fmtDate = (d: string) => {
    if (!d) return '—'
    const dt = new Date(d)
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  let yPos = margin

  // ---------- HEADER ----------
  doc.setFillColor(...dark)
  doc.rect(0, 0, pageW, 52, 'F')
  doc.setFillColor(...red)
  doc.rect(0, 52, pageW, 2.5, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('GARAGEBOOK', margin, 28)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Ownership History Report', margin, 36)

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  doc.setFontSize(7)
  doc.setTextColor(...gray)
  doc.text(`Generated ${reportDate}`, margin, 42)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('PRO', pageW - margin - 8, 28, { align: 'center' })

  yPos = 62

  // ---------- VEHICLE SPECS ----------
  const v = data.vehicle
  doc.setTextColor(...dark)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${v.year} ${v.make} ${v.model}`, margin, yPos)
  yPos += 7

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 70)

  const specs = [
    [['Trim', v.trim || '—'], ['Body Style', v.body_style || '—']],
    [['VIN', v.vin || '—'], ['Odometer', v.current_mileage ? `${v.current_mileage.toLocaleString()} mi` : '—']],
    [['Purchase Date', fmtDate(v.purchase_date || '')], ['Purchase Price', v.purchase_price ? fmt(v.purchase_price) : '—']],
  ]

  for (const row of specs) {
    for (const [label, value] of row) {
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, margin + (contentW / 2) * (row.indexOf([label, value] as [string, string])), yPos)
      const labelW = doc.getTextWidth(`${label}: `)
      doc.setFont('helvetica', 'normal')
      doc.text(value, margin + (contentW / 2) * (row.indexOf([label, value] as [string, string])) + labelW + 1, yPos)
    }
    yPos += 5
  }

  yPos += 4

  // ---------- INVESTMENT SUMMARY ----------
  doc.setFillColor(245, 245, 250)
  doc.rect(margin, yPos - 4, contentW, 36, 'F')
  doc.setFillColor(...red)
  doc.rect(margin, yPos - 4, 2.5, 36, 'F')

  doc.setTextColor(...dark)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Total Investment Summary', margin + 6, yPos + 2)
  yPos += 8

  const summaryRows = [
    ['Purchase Price', fmt(data.totals.purchase_price)],
    ['Service & Maintenance', fmt(data.totals.service_cost)],
    ['Modifications & Upgrades', fmt(data.totals.mod_cost)],
    ['Fuel, Insurance & Other', fmt(data.totals.expenses_total)],
  ]

  for (const [label, value] of summaryRows) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 90)
    doc.text(label, margin + 8, yPos)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...dark)
    doc.text(value, margin + contentW - 8, yPos, { align: 'right' })
    yPos += 4.5
  }

  // Grand total line
  doc.setDrawColor(...red)
  doc.setLineWidth(0.5)
  doc.line(margin + 8, yPos, margin + contentW - 8, yPos)
  yPos += 5
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...red)
  doc.text('Total Invested', margin + 8, yPos)
  doc.text(fmt(data.totals.grand_total), margin + contentW - 8, yPos, { align: 'right' })
  yPos += 10

  // ---------- SERVICE TIMELINE ----------
  if (data.services.length > 0) {
    // Check if we need a new page
    if (yPos > 220) {
      doc.addPage()
      yPos = margin
    }

    doc.setFillColor(...dark)
    doc.rect(margin, yPos - 4, contentW, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Service & Maintenance History', margin + 4, yPos + 1)
    yPos += 10

    const serviceTable = data.services.map((s) => [
      fmtDate(s.service_date),
      s.mileage.toLocaleString(),
      s.service_type,
      s.shop_name || '—',
      fmt(s.cost),
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Mileage', 'Service', 'Shop', 'Cost']],
      body: serviceTable,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: dark,
        fontSize: 7,
        fontStyle: 'bold',
        textColor: [255, 255, 255],
      },
      bodyStyles: { fontSize: 7, textColor: [40, 40, 50] as [number, number, number] },
      alternateRowStyles: { fillColor: [248, 248, 252] as [number, number, number] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 20, halign: 'right' },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 30 },
        4: { cellWidth: 22, halign: 'right' },
      },
      styles: { cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 } },
      tableLineColor: [220, 220, 228],
      tableLineWidth: 0.1,
    })

    // @ts-expect-error: autoTable adds lastAutoTable internally
    yPos = doc.lastAutoTable.finalY + 6
  }

  // ---------- MODIFICATIONS ----------
  if (data.modifications.length > 0) {
    if (yPos > 220) {
      doc.addPage()
      yPos = margin
    }

    doc.setFillColor(...dark)
    doc.rect(margin, yPos - 4, contentW, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Modifications & Upgrades', margin + 4, yPos + 1)
    yPos += 10

    const modTable = data.modifications.map((m) => [
      fmtDate(m.install_date),
      m.part_name,
      m.brand || '—',
      m.category || '—',
      fmt(m.cost),
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Part', 'Brand', 'Category', 'Cost']],
      body: modTable,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: dark,
        fontSize: 7,
        fontStyle: 'bold',
        textColor: [255, 255, 255],
      },
      bodyStyles: { fontSize: 7, textColor: [40, 40, 50] as [number, number, number] },
      alternateRowStyles: { fillColor: [248, 248, 252] as [number, number, number] },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 24 },
        3: { cellWidth: 22 },
        4: { cellWidth: 22, halign: 'right' },
      },
      styles: { cellPadding: { top: 1.5, right: 2, bottom: 1.5, left: 2 } },
      tableLineColor: [220, 220, 228],
      tableLineWidth: 0.1,
    })

    // @ts-expect-error: autoTable adds lastAutoTable internally
    yPos = doc.lastAutoTable.finalY + 6
  }

  // ---------- FOOTER ----------
  doc.setFillColor(...dark)
  doc.rect(0, 292, pageW, 5, 'F')
  doc.setTextColor(...gray)
  doc.setFontSize(6)
  doc.setFont('helvetica', 'normal')
  doc.text(`GarageBook Pro Report · ${reportDate}`, pageW / 2, 295.5, {
    align: 'center',
  })

  doc.save(
    `garagebook_${v.year}_${v.make}_${v.model}_report.pdf`
      .toLowerCase()
      .replace(/\s+/g, '_')
  )
}

// ============================================================
// EXCEL GENERATION
// ============================================================

async function exportExcel(data: ReportData) {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()
  const v = data.vehicle

  // --- Summary sheet ---
  const summaryData = [
    ['GarageBook Ownership Report', ''],
    ['Generated', new Date().toLocaleString()],
    ['', ''],
    ['VEHICLE SPECS', ''],
    ['Year', v.year],
    ['Make', v.make],
    ['Model', v.model],
    ['Trim', v.trim || '—'],
    ['Body Style', v.body_style || '—'],
    ['VIN', v.vin || '—'],
    ['Odometer', v.current_mileage ? `${v.current_mileage.toLocaleString()} mi` : '—'],
    ['Purchase Date', v.purchase_date || '—'],
    ['Purchase Price', data.totals.purchase_price || '—'],
    ['', ''],
    ['INVESTMENT SUMMARY', ''],
    ['Service & Maintenance', data.totals.service_cost],
    ['Modifications & Upgrades', data.totals.mod_cost],
    ['Fuel, Insurance & Other', data.totals.expenses_total],
    ['Grand Total', data.totals.grand_total],
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary')

  // --- Services sheet ---
  if (data.services.length > 0) {
    const serviceData = [
      ['Date', 'Mileage', 'Service Type', 'Description', 'Cost', 'Shop'],
      ...data.services.map((s) => [
        s.service_date,
        s.mileage,
        s.service_type,
        s.description || '',
        s.cost,
        s.shop_name || '',
      ]),
    ]
    const serviceSheet = XLSX.utils.aoa_to_sheet(serviceData)
    XLSX.utils.book_append_sheet(wb, serviceSheet, 'Services')
  }

  // --- Modifications sheet ---
  if (data.modifications.length > 0) {
    const modData = [
      ['Date', 'Part Name', 'Brand', 'Category', 'Cost', 'Notes'],
      ...data.modifications.map((m) => [
        m.install_date,
        m.part_name,
        m.brand || '',
        m.category || '',
        m.cost,
        m.notes || '',
      ]),
    ]
    const modSheet = XLSX.utils.aoa_to_sheet(modData)
    XLSX.utils.book_append_sheet(wb, modSheet, 'Modifications')
  }

  // --- Expenses sheet ---
  if (data.expenses.length > 0) {
    const expenseData = [
      ['Date', 'Category', 'Amount', 'Description', 'Mileage'],
      ...data.expenses.map((e) => [
        e.expense_date,
        e.category,
        e.amount,
        e.description || '',
        e.mileage || '',
      ]),
    ]
    const expenseSheet = XLSX.utils.aoa_to_sheet(expenseData)
    XLSX.utils.book_append_sheet(wb, expenseSheet, 'Expenses')
  }

  XLSX.writeFile(
    wb,
    `garagebook_${v.year}_${v.make}_${v.model}_report.xlsx`
      .toLowerCase()
      .replace(/\s+/g, '_')
  )
}