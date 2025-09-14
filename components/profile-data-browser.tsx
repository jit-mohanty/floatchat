"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
  Filter,
  Eye,
  Database
} from "lucide-react"
import { MeasurementViewer } from "@/components/measurement-viewer"
import { exportFilteredData, getExportSizeEstimate } from "@/lib/data-export"

interface ProfileData {
  profile_id: number
  platform_number: string
  cycle_number: number
  date_creation: string | { value: string }
  latitude: number
  longitude: number
  data_center: string
  data_centre?: string  // API returns data_centre, but we map it to data_center
  data_mode: string
  platform_type: string
  project_name: string
  pi_name: string
  profile_temp_qc: string
  profile_psal_qc: string
  profile_pres_qc: string
}

interface SortConfig {
  key: keyof ProfileData
  direction: 'asc' | 'desc'
}

interface FilterConfig {
  platform_number: string
  data_center: string
  data_mode: string
  platform_type: string
  project_name: string
  date_from: string
  date_to: string
  lat_min: string
  lat_max: string
  lon_min: string
  lon_max: string
  quality_filter: string
}

export function ProfileDataBrowser() {
  const [data, setData] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProfiles, setSelectedProfiles] = useState<Set<number>>(new Set())
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date_creation', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalRows, setTotalRows] = useState(0)
  const [totalMeasurements, setTotalMeasurements] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null)
  const [showMeasurements, setShowMeasurements] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')

  const [filters, setFilters] = useState<FilterConfig>({
    platform_number: "",
    data_center: "all",
    data_mode: "all",
    platform_type: "all",
    project_name: "all",
    date_from: "",
    date_to: "",
    lat_min: "",
    lat_max: "",
    lon_min: "",
    lon_max: "",
    quality_filter: "all"
  })

  // Real API data fetching
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      try {
        // Build query parameters
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString()
        })

        // Add search term for general search
        if (searchTerm.trim()) {
          params.append('search', searchTerm.trim())
        }

        // Add filters if they have values (excluding "all" which means no filter)
        if (filters.platform_number) params.append('platform_number', filters.platform_number)
        if (filters.data_center && filters.data_center !== 'all') params.append('data_center', filters.data_center)
        if (filters.data_mode && filters.data_mode !== 'all') params.append('data_mode', filters.data_mode)
        if (filters.date_from) params.append('start_date', filters.date_from)
        if (filters.date_to) params.append('end_date', filters.date_to)
        if (filters.lat_min) params.append('min_lat', filters.lat_min)
        if (filters.lat_max) params.append('max_lat', filters.lat_max)
        if (filters.lon_min) params.append('min_lon', filters.lon_min)
        if (filters.lon_max) params.append('max_lon', filters.lon_max)

        console.log('Fetching profiles with params:', params.toString())

        const response = await fetch(`/api/profiles?${params}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log('API response:', result)

        // Normalize the data to handle date_creation format
        const normalizedProfiles = result.profiles.map((profile: any) => ({
          ...profile,
          date_creation: typeof profile.date_creation === 'object' ?
            profile.date_creation.value : profile.date_creation
        }))

        setData(normalizedProfiles)
        setTotalRows(result.pagination.total)
        setTotalMeasurements(result.statistics?.totalMeasurements || 0)
      } catch (error) {
        console.error('Failed to fetch profiles:', error)
        setData([])
        setTotalRows(0)
        setTotalMeasurements(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [currentPage, pageSize, filters, searchTerm])

  const handleSort = (key: keyof ProfileData) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const handleSelectProfile = (profileId: number) => {
    const newSelected = new Set(selectedProfiles)
    if (newSelected.has(profileId)) {
      newSelected.delete(profileId)
    } else {
      newSelected.add(profileId)
    }
    setSelectedProfiles(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedProfiles.size === data.length) {
      setSelectedProfiles(new Set())
    } else {
      setSelectedProfiles(new Set(data.map(row => row.profile_id)))
    }
  }

  const getDataModeInfo = (mode: string) => {
    switch (mode) {
      case 'R': return { label: 'Real-time', color: 'bg-yellow-100 text-yellow-800' }
      case 'A': return { label: 'Adjusted', color: 'bg-green-100 text-green-800' }
      case 'D': return { label: 'Delayed', color: 'bg-blue-100 text-blue-800' }
      default: return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const getQualityColor = (qc: string) => {
    switch (qc) {
      case '1': return 'bg-green-100 text-green-800'
      case '2': return 'bg-yellow-100 text-yellow-800'
      case '3': return 'bg-orange-100 text-orange-800'
      case '4': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSortIcon = (column: keyof ProfileData) => {
    if (sortConfig.key !== column) return <ArrowUpDown className="ml-1 h-3 w-3" />
    return sortConfig.direction === 'asc' ?
      <ArrowUp className="ml-1 h-3 w-3" /> :
      <ArrowDown className="ml-1 h-3 w-3" />
  }

  const totalPages = Math.ceil(totalRows / pageSize)

  const handleExport = () => {
    if (selectedProfiles.size === 0) return

    const selectedData = data.filter(profile => selectedProfiles.has(profile.profile_id))
    const activeFilters = {
      ...filters,
      searchTerm,
      currentPage,
      pageSize,
      sortField: sortConfig.key,
      sortDirection: sortConfig.direction
    }

    exportFilteredData(selectedData, activeFilters, exportFormat)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center">
            <Database className="mr-3 h-8 w-8" />
            ARGO Profile Data Browser
          </h1>
          <p className="text-muted-foreground">
            {totalRows.toLocaleString()} profiles • {totalMeasurements.toLocaleString()} measurements across Indian Ocean • Page {currentPage} of {totalPages.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>

          <div className="flex items-center space-x-1">
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'json') => setExportFormat(value)}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedProfiles.size === 0}
              onClick={handleExport}
              title={selectedProfiles.size > 0 ? `Export ${selectedProfiles.size} profiles (~${getExportSizeEstimate(selectedProfiles.size, exportFormat)})` : 'Select profiles to export'}
            >
              <Download className="h-4 w-4 mr-2" />
              Export ({selectedProfiles.size})
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter Profiles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search platform numbers, data centres, projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Platform Number</label>
                <Input
                  placeholder="e.g. 5904567"
                  value={filters.platform_number}
                  onChange={(e) => setFilters({...filters, platform_number: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Data Centre</label>
                <Select value={filters.data_center} onValueChange={(value) => setFilters({...filters, data_center: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Centres</SelectItem>
                    <SelectItem value="AO">AO - Australia</SelectItem>
                    <SelectItem value="CS">CS - Canada</SelectItem>
                    <SelectItem value="IF">IF - India</SelectItem>
                    <SelectItem value="BO">BO - France</SelectItem>
                    <SelectItem value="HZ">HZ - Japan</SelectItem>
                    <SelectItem value="JA">JA - Japan Agency</SelectItem>
                    <SelectItem value="KM">KM - Korea</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Data Mode</label>
                <Select value={filters.data_mode} onValueChange={(value) => setFilters({...filters, data_mode: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="R">Real-time</SelectItem>
                    <SelectItem value="A">Adjusted</SelectItem>
                    <SelectItem value="D">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Platform Type</label>
                <Select value={filters.platform_type} onValueChange={(value) => setFilters({...filters, platform_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="APEX">APEX</SelectItem>
                    <SelectItem value="NAVIS_EBR">NAVIS_EBR</SelectItem>
                    <SelectItem value="ARVOR">ARVOR</SelectItem>
                    <SelectItem value="NOVA">NOVA</SelectItem>
                    <SelectItem value="PROVOR">PROVOR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Date From</label>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters({...filters, date_from: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Date To</label>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters({...filters, date_to: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Latitude Min</label>
                <Input
                  type="number"
                  placeholder="-90"
                  step="0.001"
                  value={filters.lat_min}
                  onChange={(e) => setFilters({...filters, lat_min: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Latitude Max</label>
                <Input
                  type="number"
                  placeholder="90"
                  step="0.001"
                  value={filters.lat_max}
                  onChange={(e) => setFilters({...filters, lat_max: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Longitude Min</label>
                <Input
                  type="number"
                  placeholder="-180"
                  step="0.001"
                  value={filters.lon_min}
                  onChange={(e) => setFilters({...filters, lon_min: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Longitude Max</label>
                <Input
                  type="number"
                  placeholder="180"
                  step="0.001"
                  value={filters.lon_max}
                  onChange={(e) => setFilters({...filters, lon_max: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Project</label>
                <Select value={filters.project_name} onValueChange={(value) => setFilters({...filters, project_name: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    <SelectItem value="Argo_INDIA">Argo India</SelectItem>
                    <SelectItem value="Argo_eq_PACIFIC">Argo Equatorial Pacific</SelectItem>
                    <SelectItem value="RAMA">RAMA</SelectItem>
                    <SelectItem value="PIRATA">PIRATA</SelectItem>
                    <SelectItem value="SOSCUEx">SOSCUEx</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Quality Filter</label>
                <Select value={filters.quality_filter} onValueChange={(value) => setFilters({...filters, quality_filter: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quality</SelectItem>
                    <SelectItem value="good">Good Quality (QC=1)</SelectItem>
                    <SelectItem value="probably_good">Probably Good (QC=2)</SelectItem>
                    <SelectItem value="correctable">Correctable (QC=3)</SelectItem>
                    <SelectItem value="bad">Bad (QC=4)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({
                    platform_number: "",
                    data_center: "all",
                    data_mode: "all",
                    platform_type: "all",
                    project_name: "all",
                    date_from: "",
                    date_to: "",
                    lat_min: "",
                    lat_max: "",
                    lon_min: "",
                    lon_max: "",
                    quality_filter: "all"
                  })
                  setSearchTerm("")
                  setCurrentPage(1)
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedProfiles.size === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('platform_number')}>
                      Platform
                      {getSortIcon('platform_number')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('cycle_number')}>
                      Cycle
                      {getSortIcon('cycle_number')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('date_creation')}>
                      Date Created
                      {getSortIcon('date_creation')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('latitude')}>
                      Position
                      {getSortIcon('latitude')}
                    </Button>
                  </TableHead>
                  <TableHead>Data Centre</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Platform Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Quality (T/S/P)</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: pageSize }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  data.map((profile) => {
                    const dataModeInfo = getDataModeInfo(profile.data_mode)
                    return (
                      <TableRow
                        key={profile.profile_id}
                        className={selectedProfiles.has(profile.profile_id) ? "bg-muted/50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedProfiles.has(profile.profile_id)}
                            onCheckedChange={() => handleSelectProfile(profile.profile_id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          {profile.platform_number}
                        </TableCell>
                        <TableCell>{profile.cycle_number}</TableCell>
                        <TableCell className="text-sm">
                          {typeof profile.date_creation === 'object'
                            ? new Date(profile.date_creation.value).toLocaleDateString()
                            : new Date(profile.date_creation).toLocaleDateString()
                          }
                        </TableCell>
                        <TableCell className="text-xs">
                          {profile.latitude.toFixed(3)}°, {profile.longitude.toFixed(3)}°
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{profile.data_center}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={dataModeInfo.color}>
                            {dataModeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {profile.platform_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-32 truncate" title={profile.project_name}>
                          {profile.project_name}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Badge className={getQualityColor(profile.profile_temp_qc)} title="Temperature QC">
                              T:{profile.profile_temp_qc}
                            </Badge>
                            <Badge className={getQualityColor(profile.profile_psal_qc)} title="Salinity QC">
                              S:{profile.profile_psal_qc}
                            </Badge>
                            <Badge className={getQualityColor(profile.profile_pres_qc)} title="Pressure QC">
                              P:{profile.profile_pres_qc}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProfile(profile)
                              setShowMeasurements(true)
                            }}
                            title="View measurements"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedProfiles.size > 0 && (
            <Badge variant="secondary">
              {selectedProfiles.size} profile{selectedProfiles.size !== 1 ? 's' : ''} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-4 py-2">
            Page {currentPage.toLocaleString()} of {totalPages.toLocaleString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selection Summary */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {((currentPage - 1) * pageSize + 1).toLocaleString()} to {Math.min(currentPage * pageSize, totalRows).toLocaleString()} of {totalRows.toLocaleString()} profiles
            </span>
            <span>
              {selectedProfiles.size} selected across all pages
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Viewer Dialog */}
      <MeasurementViewer
        profile={selectedProfile}
        isOpen={showMeasurements}
        onClose={() => {
          setShowMeasurements(false)
          setSelectedProfile(null)
        }}
      />
    </div>
  )
}