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
  Download,
  Search,
  Filter
} from "lucide-react"

interface DataRow {
  platform_number: string
  cycle_number: number
  date: string
  latitude: number
  longitude: number
  data_centre: string
  data_mode: string
  profiles: number
  temperature_avg: number
  salinity_avg: number
  max_depth: number
}

interface SortConfig {
  key: keyof DataRow
  direction: 'asc' | 'desc'
}

interface FilterConfig {
  platform_number: string
  data_center: string
  data_mode: string
  start_date: string
  end_date: string
  min_lat: number
  max_lat: number
  min_lon: number
  max_lon: number
}

export function DataTable() {
  const [data, setData] = useState<DataRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalRows, setTotalRows] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState<FilterConfig>({
    platform_number: "",
    data_center: "",
    data_mode: "",
    start_date: "",
    end_date: "",
    min_lat: -90,
    max_lat: 90,
    min_lon: -180,
    max_lon: 180
  })

  // Mock data for now - will connect to real API
  useEffect(() => {
    const mockData: DataRow[] = Array.from({ length: pageSize }, (_, i) => ({
      platform_number: `590${Math.floor(Math.random() * 9999)}`,
      cycle_number: Math.floor(Math.random() * 200) + 1,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      latitude: Math.random() * 60 - 30,
      longitude: Math.random() * 90 + 30,
      data_centre: ['IF', 'AO', 'BO', 'CS', 'HZ'][Math.floor(Math.random() * 5)],
      data_mode: ['R', 'A', 'D'][Math.floor(Math.random() * 3)],
      profiles: Math.floor(Math.random() * 150) + 10,
      temperature_avg: Math.random() * 30 - 2,
      salinity_avg: Math.random() * 10 + 30,
      max_depth: Math.floor(Math.random() * 1800) + 200
    }))

    setData(mockData)
    setTotalRows(15234) // Mock total
    setLoading(false)
  }, [currentPage, pageSize, sortConfig, filters])

  const handleSort = (key: keyof DataRow) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  const handleSelectRow = (platformNumber: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(platformNumber)) {
      newSelected.delete(platformNumber)
    } else {
      newSelected.add(platformNumber)
    }
    setSelectedRows(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map(row => row.platform_number)))
    }
  }

  const getDataModeColor = (mode: string) => {
    switch (mode) {
      case 'R': return 'bg-yellow-100 text-yellow-800'
      case 'A': return 'bg-green-100 text-green-800'
      case 'D': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDataModeLabel = (mode: string) => {
    switch (mode) {
      case 'R': return 'Real-time'
      case 'A': return 'Adjusted'
      case 'D': return 'Delayed'
      default: return 'Unknown'
    }
  }

  const totalPages = Math.ceil(totalRows / pageSize)

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">ARGO Data Browser</h2>
          <p className="text-sm text-muted-foreground">
            {totalRows.toLocaleString()} profiles • Page {currentPage} of {totalPages}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" disabled={selectedRows.size === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export ({selectedRows.size})
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by platform number, data centre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 pt-4 border-t">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Platform</label>
                <Input
                  placeholder="590XXXX"
                  value={filters.platform_number}
                  onChange={(e) => setFilters({...filters, platform_number: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Data Centre</label>
                <Select value={filters.data_center} onValueChange={(value) => setFilters({...filters, data_center: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="IF">IF - India</SelectItem>
                    <SelectItem value="AO">AO - Australia</SelectItem>
                    <SelectItem value="BO">BO - France</SelectItem>
                    <SelectItem value="CS">CS - Canada</SelectItem>
                    <SelectItem value="HZ">HZ - Japan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Data Mode</label>
                <Select value={filters.data_mode} onValueChange={(value) => setFilters({...filters, data_mode: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="R">Real-time</SelectItem>
                    <SelectItem value="A">Adjusted</SelectItem>
                    <SelectItem value="D">Delayed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date From</label>
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Date To</label>
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Min Latitude</label>
                <Input
                  type="number"
                  step="0.1"
                  value={filters.min_lat}
                  onChange={(e) => setFilters({...filters, min_lat: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Max Latitude</label>
                <Input
                  type="number"
                  step="0.1"
                  value={filters.max_lat}
                  onChange={(e) => setFilters({...filters, max_lat: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Min Longitude</label>
                <Input
                  type="number"
                  step="0.1"
                  value={filters.min_lon}
                  onChange={(e) => setFilters({...filters, min_lon: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Max Longitude</label>
                <Input
                  type="number"
                  step="0.1"
                  value={filters.max_lon}
                  onChange={(e) => setFilters({...filters, max_lon: Number(e.target.value)})}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === data.length && data.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('platform_number')}>
                      Platform
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('cycle_number')}>
                      Cycle
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('date')}>
                      Date
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('latitude')}>
                      Location
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Data Centre</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('profiles')}>
                      Profiles
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Temp (°C)</TableHead>
                  <TableHead>Salinity</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('max_depth')}>
                      Max Depth
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-muted animate-pulse rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  data.map((row) => (
                    <TableRow
                      key={row.platform_number}
                      className={selectedRows.has(row.platform_number) ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedRows.has(row.platform_number)}
                          onCheckedChange={() => handleSelectRow(row.platform_number)}
                        />
                      </TableCell>
                      <TableCell className="font-mono">{row.platform_number}</TableCell>
                      <TableCell>{row.cycle_number}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell className="text-xs">
                        {row.latitude.toFixed(2)}°, {row.longitude.toFixed(2)}°
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{row.data_centre}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getDataModeColor(row.data_mode)}>
                          {getDataModeLabel(row.data_mode)}
                        </Badge>
                      </TableCell>
                      <TableCell>{row.profiles}</TableCell>
                      <TableCell>{row.temperature_avg.toFixed(1)}</TableCell>
                      <TableCell>{row.salinity_avg.toFixed(1)}</TableCell>
                      <TableCell>{row.max_depth}m</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Rows per page:</span>
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-16">
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
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm px-3">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
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
    </div>
  )
}