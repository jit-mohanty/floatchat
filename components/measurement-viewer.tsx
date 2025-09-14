"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Thermometer,
  Droplets,
  Gauge,
  X,
  Download
} from "lucide-react"
import { exportMeasurements } from "@/lib/data-export"

interface MeasurementData {
  measurement_id: number
  level_index: number
  pres_adjusted: number
  temp_adjusted: number
  psal_adjusted: number
  temp_qc: string
  psal_qc: string
  pres_qc: string
  temp_adjusted_error?: number
  psal_adjusted_error?: number
  pres_adjusted_error?: number
}

interface ProfileData {
  profile_id: number
  platform_number: string
  cycle_number: number
  date_creation: string | { value: string }
  latitude: number
  longitude: number
  data_center?: string
  data_mode?: string
  platform_type?: string
  project_name?: string
  pi_name?: string
  profile_temp_qc?: string
  profile_psal_qc?: string
  profile_pres_qc?: string
}

interface MeasurementViewerProps {
  profile: ProfileData | null
  isOpen: boolean
  onClose: () => void
}

type SortField = 'level_index' | 'pres_adjusted' | 'temp_adjusted' | 'psal_adjusted'
type SortDirection = 'asc' | 'desc'

export function MeasurementViewer({ profile, isOpen, onClose }: MeasurementViewerProps) {
  const [measurements, setMeasurements] = useState<MeasurementData[]>([])
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<SortField>('level_index')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [qualityFilter, setQualityFilter] = useState<string>('all')
  const [depthFilter, setDepthFilter] = useState<string>('')
  const [tempFilter, setTempFilter] = useState<string>('')
  const [salFilter, setSalFilter] = useState<string>('')
  const [dialogSize, setDialogSize] = useState({ width: 95, height: 95 })

  // Real data fetching from BigQuery API
  useEffect(() => {
    if (!profile || !isOpen) {
      setMeasurements([])
      return
    }

    const fetchMeasurements = async () => {
      setLoading(true)
      try {
        console.log(`Fetching measurements for profile ${profile.profile_id}...`)

        const response = await fetch(`/api/profiles/${profile.profile_id}/measurements`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log(`Received ${result.measurements.length} measurements from API`)

        setMeasurements(result.measurements)
      } catch (error) {
        console.error('Failed to fetch measurements:', error)
        setMeasurements([])
      } finally {
        setLoading(false)
      }
    }

    fetchMeasurements()
  }, [profile, isOpen])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3" />
    return sortDirection === 'asc' ?
      <ArrowUp className="ml-1 h-3 w-3" /> :
      <ArrowDown className="ml-1 h-3 w-3" />
  }

  const getQualityColor = (qc: string) => {
    switch (qc) {
      case '1': return 'bg-green-100 text-green-800 border-green-300'
      case '2': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case '3': return 'bg-orange-100 text-orange-800 border-orange-300'
      case '4': return 'bg-red-100 text-red-800 border-red-300'
      case '8': return 'bg-blue-100 text-blue-800 border-blue-300'
      case '9': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getQualityLabel = (qc: string) => {
    switch (qc) {
      case '1': return 'Good'
      case '2': return 'Probably good'
      case '3': return 'Probably bad'
      case '4': return 'Bad'
      case '8': return 'Estimated'
      case '9': return 'Missing'
      default: return 'Unknown'
    }
  }

  // Filter and sort measurements
  const filteredAndSortedMeasurements = measurements
    .filter(m => {
      if (qualityFilter !== 'all') {
        const hasGoodQuality = m.temp_qc === '1' && m.psal_qc === '1' && m.pres_qc === '1'
        if (qualityFilter === 'good' && !hasGoodQuality) return false
        if (qualityFilter === 'bad' && hasGoodQuality) return false
      }

      if (depthFilter && !m.pres_adjusted.toString().includes(depthFilter)) return false
      if (tempFilter && !m.temp_adjusted.toString().includes(tempFilter)) return false
      if (salFilter && !m.psal_adjusted.toString().includes(salFilter)) return false

      return true
    })
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      const multiplier = sortDirection === 'asc' ? 1 : -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * multiplier
      }
      return String(aVal).localeCompare(String(bVal)) * multiplier
    })

  const goodQualityCount = measurements.filter(m => m.temp_qc === '1' && m.psal_qc === '1' && m.pres_qc === '1').length
  const qualityPercentage = measurements.length > 0 ? (goodQualityCount / measurements.length * 100).toFixed(1) : 0

  if (!profile) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
  className="!max-w-none w-[95vw] h-[95vh] p-0 m-0"
  style={{
    resize: 'both',
    overflow: 'auto'
  }}
>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">
              Profile Measurements - Platform {profile.platform_number}
            </h2>
            <div className="text-sm text-muted-foreground">
              Cycle {profile.cycle_number} • {
                typeof profile.date_creation === 'object'
                  ? new Date(profile.date_creation.value).toLocaleDateString()
                  : new Date(profile.date_creation).toLocaleDateString()
              } •
              {profile.latitude.toFixed(3)}°, {profile.longitude.toFixed(3)}°
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* Size Controls */}
            <div className="flex items-center space-x-2 text-xs">
              <label>Width:</label>
              <Input
                type="range"
                min="50"
                max="100"
                value={dialogSize.width}
                onChange={(e) => setDialogSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                className="w-16 h-6"
              />
              <span className="w-8">{dialogSize.width}%</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <label>Height:</label>
              <Input
                type="range"
                min="50"
                max="100"
                value={dialogSize.height}
                onChange={(e) => setDialogSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                className="w-16 h-6"
              />
              <span className="w-8">{dialogSize.height}%</span>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Size Presets */}
        <div className="px-6 pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Quick sizes:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogSize({ width: 70, height: 70 })}
              className="text-xs px-2 py-1 h-6"
            >
              Small
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogSize({ width: 85, height: 85 })}
              className="text-xs px-2 py-1 h-6"
            >
              Medium
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogSize({ width: 95, height: 95 })}
              className="text-xs px-2 py-1 h-6"
            >
              Large
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogSize({ width: 100, height: 100 })}
              className="text-xs px-2 py-1 h-6"
            >
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
          {/* Stats and Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="text-sm">
                {filteredAndSortedMeasurements.length} measurements
              </Badge>
              <Badge className="bg-green-100 text-green-800 text-sm">
                {qualityPercentage}% good quality
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (profile) {
                  exportMeasurements(filteredAndSortedMeasurements, {
                    platform_number: profile.platform_number,
                    cycle_number: profile.cycle_number
                  }, 'csv')
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Quality Filter</label>
                  <Select value={qualityFilter} onValueChange={setQualityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quality</SelectItem>
                      <SelectItem value="good">Good Quality Only</SelectItem>
                      <SelectItem value="bad">Problematic Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Depth Filter</label>
                  <Input
                    placeholder="Filter depth..."
                    value={depthFilter}
                    onChange={(e) => setDepthFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Temp Filter</label>
                  <Input
                    placeholder="Filter temp..."
                    value={tempFilter}
                    onChange={(e) => setTempFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Sal Filter</label>
                  <Input
                    placeholder="Filter salinity..."
                    value={salFilter}
                    onChange={(e) => setSalFilter(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setQualityFilter('all')
                      setDepthFilter('')
                      setTempFilter('')
                      setSalFilter('')
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Measurements Table */}
          <div className="flex-1 overflow-auto border rounded-lg">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-20">Level</TableHead>
                  <TableHead className="min-w-[140px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('pres_adjusted')}
                      className="flex items-center h-auto p-2"
                    >
                      <Gauge className="h-4 w-4 mr-1" />
                      Pressure (dbar)
                      {getSortIcon('pres_adjusted')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('temp_adjusted')}
                      className="flex items-center h-auto p-2"
                    >
                      <Thermometer className="h-4 w-4 mr-1" />
                      Temperature (°C)
                      {getSortIcon('temp_adjusted')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[140px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('psal_adjusted')}
                      className="flex items-center h-auto p-2"
                    >
                      <Droplets className="h-4 w-4 mr-1" />
                      Salinity (PSU)
                      {getSortIcon('psal_adjusted')}
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[120px]">Quality Flags</TableHead>
                  <TableHead className="min-w-[100px]">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 20 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  filteredAndSortedMeasurements.map((measurement) => (
                    <TableRow key={measurement.measurement_id}>
                      <TableCell className="font-mono text-sm">
                        {measurement.level_index}
                      </TableCell>
                      <TableCell className="font-mono">
                        {measurement.pres_adjusted.toFixed(1)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {measurement.temp_adjusted.toFixed(3)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {measurement.psal_adjusted.toFixed(3)}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        <div className="flex flex-wrap gap-1">
                          <Badge
                            className={`text-xs border shrink-0 ${getQualityColor(measurement.temp_qc)}`}
                            title={`Temperature QC: ${getQualityLabel(measurement.temp_qc)}`}
                          >
                            T:{measurement.temp_qc}
                          </Badge>
                          <Badge
                            className={`text-xs border shrink-0 ${getQualityColor(measurement.psal_qc)}`}
                            title={`Salinity QC: ${getQualityLabel(measurement.psal_qc)}`}
                          >
                            S:{measurement.psal_qc}
                          </Badge>
                          <Badge
                            className={`text-xs border shrink-0 ${getQualityColor(measurement.pres_qc)}`}
                            title={`Pressure QC: ${getQualityLabel(measurement.pres_qc)}`}
                          >
                            P:{measurement.pres_qc}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground min-w-[100px]">
                        <div className="space-y-1">
                          {measurement.temp_adjusted_error && (
                            <div className="whitespace-nowrap">T: ±{measurement.temp_adjusted_error.toFixed(3)}</div>
                          )}
                          {measurement.psal_adjusted_error && (
                            <div className="whitespace-nowrap">S: ±{measurement.psal_adjusted_error.toFixed(4)}</div>
                          )}
                          {measurement.pres_adjusted_error && (
                            <div className="whitespace-nowrap">P: ±{measurement.pres_adjusted_error.toFixed(1)}</div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedMeasurements.length} of {measurements.length} measurements
          {measurements.length > 0 && (
            <>
              {' • '}
              Depth range: {Math.min(...measurements.map(m => m.pres_adjusted)).toFixed(0)} - {Math.max(...measurements.map(m => m.pres_adjusted)).toFixed(0)} dbar
              {' • '}
              Temp range: {Math.min(...measurements.map(m => m.temp_adjusted)).toFixed(2)} - {Math.max(...measurements.map(m => m.temp_adjusted)).toFixed(2)}°C
            </>
          )}
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}