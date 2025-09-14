"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterPlot, Line } from "recharts"
import { useDashboard } from "@/components/dashboard"
import { Calculator, TrendingUp, BarChart3, ScanTextIcon, Activity } from "lucide-react"

export function StatisticalAnalysisTools() {
  const { floats, loading } = useDashboard()
  const [selectedParameter, setSelectedParameter] = useState("temperature")
  const [analysisType, setAnalysisType] = useState("distribution")

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  // Statistical calculations
  const calculateStatistics = (parameter: string) => {
    const values = floats
      .map((f) => {
        switch (parameter) {
          case "temperature":
            return f.temperature
          case "salinity":
            return f.salinity
          case "depth":
            return f.depth
          case "pressure":
            return f.pressure
          default:
            return f.temperature
        }
      })
      .filter((v) => v !== undefined)

    if (values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length
    const std = Math.sqrt(variance)
    const median =
      sorted.length % 2 !== 0
        ? sorted[Math.floor(sorted.length / 2)]
        : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2

    // Calculate percentiles
    const percentile = (p: number) => {
      const index = (p / 100) * (sorted.length - 1)
      const lower = Math.floor(index)
      const upper = Math.ceil(index)
      const weight = index % 1
      return sorted[lower] * (1 - weight) + sorted[upper] * weight
    }

    return {
      count: values.length,
      mean,
      median,
      std,
      variance,
      min: Math.min(...values),
      max: Math.max(...values),
      q1: percentile(25),
      q3: percentile(75),
      iqr: percentile(75) - percentile(25),
      skewness: calculateSkewness(values, mean, std),
      kurtosis: calculateKurtosis(values, mean, std),
    }
  }

  const calculateSkewness = (values: number[], mean: number, std: number) => {
    const n = values.length
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / std, 3), 0)
    return (n / ((n - 1) * (n - 2))) * sum
  }

  const calculateKurtosis = (values: number[], mean: number, std: number) => {
    const n = values.length
    const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / std, 4), 0)
    return ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) * sum - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3))
  }

  // Create histogram data
  const createHistogramData = (parameter: string) => {
    const values = floats
      .map((f) => {
        switch (parameter) {
          case "temperature":
            return f.temperature
          case "salinity":
            return f.salinity
          case "depth":
            return f.depth
          case "pressure":
            return f.pressure
          default:
            return f.temperature
        }
      })
      .filter((v) => v !== undefined)

    const min = Math.min(...values)
    const max = Math.max(...values)
    const binCount = Math.min(20, Math.ceil(Math.sqrt(values.length)))
    const binWidth = (max - min) / binCount

    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`,
      count: 0,
      midpoint: min + (i + 0.5) * binWidth,
    }))

    values.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1)
      bins[binIndex].count++
    })

    return bins
  }

  // Create correlation data
  const createCorrelationData = () => {
    return floats.map((f) => ({
      temperature: f.temperature,
      salinity: f.salinity,
      depth: f.depth,
      pressure: f.pressure,
      id: f.id,
    }))
  }

  const stats = calculateStatistics(selectedParameter)
  const histogramData = createHistogramData(selectedParameter)
  const correlationData = createCorrelationData()

  const getParameterUnit = (param: string) => {
    switch (param) {
      case "temperature":
        return "°C"
      case "salinity":
        return "PSU"
      case "depth":
        return "m"
      case "pressure":
        return "dbar"
      default:
        return ""
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calculator className="h-5 w-5" />
          <span>Statistical Analysis Tools</span>
        </CardTitle>
        <div className="flex space-x-2">
          <Select value={selectedParameter} onValueChange={setSelectedParameter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="salinity">Salinity</SelectItem>
              <SelectItem value="depth">Depth</SelectItem>
              <SelectItem value="pressure">Pressure</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="descriptive" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="descriptive">
              <Activity className="h-3 w-3 mr-1" />
              Descriptive
            </TabsTrigger>
            <TabsTrigger value="distribution">
              <BarChart3 className="h-3 w-3 mr-1" />
              Distribution
            </TabsTrigger>
            <TabsTrigger value="correlation">
              <ScanTextIcon className="h-3 w-3 mr-1" />
              Correlation
            </TabsTrigger>
            <TabsTrigger value="trends">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="descriptive" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="p-3">
                  <div className="text-lg font-bold">{stats.mean.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Mean {getParameterUnit(selectedParameter)}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-lg font-bold">{stats.median.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Median {getParameterUnit(selectedParameter)}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-lg font-bold">±{stats.std.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Std Dev {getParameterUnit(selectedParameter)}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-lg font-bold">{stats.min.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Minimum {getParameterUnit(selectedParameter)}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-lg font-bold">{stats.max.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">Maximum {getParameterUnit(selectedParameter)}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-lg font-bold">{stats.iqr.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">IQR {getParameterUnit(selectedParameter)}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-lg font-bold">{stats.skewness.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Skewness</div>
                </Card>
                <Card className="p-3">
                  <div className="text-lg font-bold">{stats.kurtosis.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">Kurtosis</div>
                </Card>
                <Card className="p-3">
                  <div className="text-lg font-bold">{stats.count}</div>
                  <div className="text-xs text-muted-foreground">Sample Size</div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground">
              Distribution of {selectedParameter} values across {floats.length} ARGO floats
            </div>
          </TabsContent>

          <TabsContent value="correlation" className="space-y-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterPlot>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="temperature" name="Temperature" unit="°C" />
                  <YAxis dataKey="salinity" name="Salinity" unit="PSU" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Line name="T-S Relationship" data={correlationData} stroke="#3b82f6" />
                </ScatterPlot>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-muted-foreground">
              Temperature-Salinity correlation plot showing oceanographic relationships
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-3">
                <div className="text-sm font-medium mb-2">Active vs Inactive Floats</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs">Active</span>
                    <Badge variant="default">{floats.filter((f) => f.status === "active").length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Inactive</span>
                    <Badge variant="secondary">{floats.filter((f) => f.status === "inactive").length}</Badge>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="text-sm font-medium mb-2">Depth Distribution</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs">0-500m</span>
                    <Badge variant="outline">{floats.filter((f) => f.depth <= 500).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">500-1500m</span>
                    <Badge variant="outline">{floats.filter((f) => f.depth > 500 && f.depth <= 1500).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">1500m+</span>
                    <Badge variant="outline">{floats.filter((f) => f.depth > 1500).length}</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
