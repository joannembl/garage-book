'use client'

import React, { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FileUp, 
  Table as TableIcon, 
  Check, 
  AlertCircle, 
  Loader2, 
  BrainCircuit,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { analyzeImportMapping, executeBatchImport, ColumnMapping } from '@/app/actions/import'
import { cn } from '@/lib/utils'

interface ImportLogsDialogProps {
  vehicleId: string
  isPro: boolean
  onImportComplete?: () => void
}

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

export function ImportLogsDialog({ vehicleId, isPro, onImportComplete }: ImportLogsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>('upload')
  const [recordType, setRecordType] = useState<'maintenance' | 'modification'>('maintenance')
  const [fileName, setFileName] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [data, setData] = useState<any[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importCount, setImportCount] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('upload')
    setFileName(null)
    setHeaders([])
    setData([])
    setMapping({})
    setError(null)
    setImportCount(0)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      const bstr = event.target?.result
      if (file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length > 0) {
              setHeaders(Object.keys(results.data[0] as object))
              setData(results.data)
              startAnalysis(Object.keys(results.data[0] as object), results.data.slice(0, 5))
            } else {
              setError('The file seems to be empty.')
            }
          }
        })
      } else {
        const workbook = XLSX.read(bstr, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        if (json.length > 0) {
          setHeaders(Object.keys(json[0] as object))
          setData(json)
          startAnalysis(Object.keys(json[0] as object), json.slice(0, 5))
        } else {
          setError('The file seems to be empty.')
        }
      }
    }
    
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
  }

  const startAnalysis = async (headers: string[], sample: any[]) => {
    setIsAnalyzing(true)
    setStep('mapping')
    
    try {
      const result = await analyzeImportMapping(headers, sample, recordType)
      if (result.error) {
        setError(result.error)
      } else if (result.mapping) {
        setMapping(result.mapping)
      }
    } catch (err) {
      setError('Failed to analyze data mapping.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExecuteImport = async () => {
    setIsExecuting(true)
    setError(null)
    
    try {
      const result = await executeBatchImport(vehicleId, recordType, data, mapping)
      if (result.error) {
        setError(result.error)
      } else {
        setImportCount(result.count || 0)
        setStep('complete')
        if (onImportComplete) onImportComplete()
      }
    } catch (err) {
      setError('Batch import failed unexpectedly.')
    } finally {
      setIsExecuting(false)
    }
  }

  const maintenanceFields = [
    { key: 'service_date', label: 'Service Date', required: true },
    { key: 'mileage', label: 'Mileage/Odometer', required: true },
    { key: 'service_type', label: 'Service Type', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'cost', label: 'Total Cost', required: false },
    { key: 'shop_name', label: 'Shop/Location', required: false },
  ]

  const modificationFields = [
    { key: 'install_date', label: 'Install Date', required: true },
    { key: 'part_name', label: 'Part Name', required: true },
    { key: 'brand', label: 'Brand', required: false },
    { key: 'category', label: 'Category', required: false },
    { key: 'cost', label: 'Cost', required: false },
    { key: 'notes', label: 'Notes', required: false },
  ]

  const fields = recordType === 'maintenance' ? maintenanceFields : modificationFields

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) reset()
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          <span>Import Logs</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary fill-primary/10" />
            AI-Assisted Spreadsheet Import
          </DialogTitle>
          <DialogDescription>
            Import your maintenance or modification history from Excel or CSV files.
          </DialogDescription>
        </DialogHeader>

        {!isPro && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
            <h4 className="text-sm font-bold text-amber-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Pro Feature
            </h4>
            <p className="text-xs text-amber-700/80 mt-1">
              AI-assisted imports are available for Pro subscribers. Upgrade to unlock this and other advanced features.
            </p>
            <Button size="sm" className="mt-3 text-xs bg-amber-600 hover:bg-amber-700" onClick={() => window.location.href = '/profile'}>
              Upgrade to Pro
            </Button>
          </div>
        )}

        <div className={cn("mt-2", !isPro && "opacity-50 pointer-events-none")}>
          {step === 'upload' && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={recordType === 'maintenance' ? 'default' : 'outline'}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setRecordType('maintenance')}
                >
                  <TableIcon className="h-6 w-6" />
                  <span>Maintenance Records</span>
                </Button>
                <Button 
                  variant={recordType === 'modification' ? 'default' : 'outline'}
                  className="h-20 flex flex-col gap-2"
                  onClick={() => setRecordType('modification')}
                >
                  <BrainCircuit className="h-6 w-6" />
                  <span>Modifications Build</span>
                </Button>
              </div>

              <div 
                className="border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FileUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">Excel (.xlsx) or CSV files supported</p>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".csv, .xlsx"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <Check className="h-4 w-4 text-emerald-500" />
                  )}
                  {isAnalyzing ? 'AI is analyzing your headers...' : 'AI identified these columns'}
                </h4>
                <p className="text-xs text-muted-foreground">{fileName}</p>
              </div>

              <div className="grid gap-3">
                {fields.map(field => (
                  <div key={field.key} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </span>
                    </div>
                    <select 
                      className="text-xs h-8 rounded border bg-muted px-2 min-w-[180px]"
                      value={(mapping as any)[field.key] || ''}
                      onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                    >
                      <option value="">-- Ignore Field --</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 text-red-500 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>Back</Button>
                <Button size="sm" onClick={() => setStep('preview')} disabled={isAnalyzing}>
                  Preview Import
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">Preview (First 5 Rows)</h4>
                <p className="text-xs text-muted-foreground">{data.length} total records found</p>
              </div>

              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted border-b">
                    <tr>
                      {fields.filter(f => (mapping as any)[f.key]).map(f => (
                        <th key={f.key} className="px-3 py-2 font-bold">{(mapping as any)[f.key]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-b last:border-0">
                        {fields.filter(f => (mapping as any)[f.key]).map(f => (
                          <td key={f.key} className="px-3 py-2 text-muted-foreground truncate max-w-[150px]">
                            {String(row[(mapping as any)[f.key]])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-xs font-medium">
                  We will import <span className="font-bold text-primary">{data.length}</span> records into your {recordType} history. Malformed rows will be skipped.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="ghost" size="sm" onClick={() => setStep('mapping')}>Back</Button>
                <Button size="sm" onClick={handleExecuteImport} disabled={isExecuting}>
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Execute Batch Import
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Import Successful!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Successfully imported <span className="font-bold text-foreground">{importCount}</span> records to your vehicle history.
                </p>
              </div>
              <Button className="mt-4" onClick={() => setIsOpen(false)}>
                View History
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
