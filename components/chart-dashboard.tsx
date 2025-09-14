"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Dot,
  Globe,
  Loader2,
  RefreshCw
} from "lucide-react"

interface ChartConfig {
  title: string
  description: string
  type: "map" | "pie" | "line" | "bar" | "scatter"
}

interface ChartData {
  success: boolean
  chartType: string
  config: ChartConfig
  data: any
  lastUpdated: string
}

const CHART_OPTIONS = [
  { value: "global-distribution", label: "🌍 Global Float Distribution", icon: Globe, description: "Interactive world map of ARGO floats" },
  { value: "data-mode-pie", label: "📊 Data Mode Distribution", icon: PieChartIcon, description: "Real-time vs Adjusted data breakdown" },
  { value: "temperature-trends", label: "🌡️ Temperature Trends", icon: LineChartIcon, description: "Regional temperature over time" },
  { value: "salinity-depth", label: "💧 Salinity vs Depth", icon: LineChartIcon, description: "Ocean salinity profile by depth" },
  { value: "ts-scatter", label: "🔬 T-S Diagram", icon: Dot, description: "Temperature-Salinity scatter plot" },
  { value: "pressure-distribution", label: "📏 Depth Distribution", icon: BarChart3, description: "Measurement distribution by depth" },
  { value: "deployments-timeline", label: "📅 Deployments Timeline", icon: BarChart3, description: "Historical deployment activity" },
  { value: "regional-distribution", label: "🌐 Regional Distribution", icon: BarChart3, description: "Float distribution by region" }
]

const COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
  '#d084d0', '#87ceeb', '#ffb347', '#98fb98', '#f0e68c'
]

export function ChartDashboard() {
  const [selectedChart, setSelectedChart] = useState<string>("data-mode-pie")
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = async (chartType: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/charts?type=${chartType}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`)
      }

      const data: ChartData = await response.json()
      setChartData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chart data")
      setChartData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData(selectedChart)
  }, [selectedChart])

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button
              onClick={() => fetchChartData(selectedChart)}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      )
    }

    if (!chartData?.data) {
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">No data available</p>
        </div>
      )
    }

    const { config, data } = chartData

    switch (config.type) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data.distribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.distribution.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'line':
        if (selectedChart === 'temperature-trends') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {data.regions?.map((region: string, index: number) => (
                  <Line
                    key={region}
                    type="monotone"
                    dataKey={region}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )
        } else if (selectedChart === 'salinity-depth') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.profile}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="salinity"
                  label={{ value: 'Salinity (PSU)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  dataKey="depth"
                  reversed={true}
                  label={{ value: 'Depth (dbar)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'salinity' ? `${value} PSU` : `${value} dbar`,
                    name === 'salinity' ? 'Salinity' : 'Depth'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="salinity"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )
        }
        break

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data.points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="temperature"
                label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis
                dataKey="salinity"
                label={{ value: 'Salinity (PSU)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value, name) => [
                  name === 'temperature' ? `${value}°C` : `${value} PSU`,
                  name === 'temperature' ? 'Temperature' : 'Salinity'
                ]}
              />
              <Scatter fill="#8884d8" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case 'bar':
        if (selectedChart === 'pressure-distribution') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="depth_range" />
                <YAxis label={{ value: 'Measurement Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )
        } else if (selectedChart === 'deployments-timeline') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="profiles" fill="#8884d8" name="Profiles" />
                <Bar dataKey="floats" fill="#82ca9d" name="Floats" />
              </BarChart>
            </ResponsiveContainer>
          )
        } else if (selectedChart === 'regional-distribution') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data.regions} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="region" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="float_count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          )
        }
        break

      case 'map':
        return (
          <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Globe className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
              <p className="text-muted-foreground mb-4">
                Found {data.total} floats worldwide
              </p>
              <p className="text-sm text-muted-foreground">
                Map integration with Leaflet/MapBox coming soon
              </p>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Chart type not implemented</p>
          </div>
        )
    }
  }

  const currentChartOption = CHART_OPTIONS.find(opt => opt.value === selectedChart)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Chart Dashboard</h2>
          <p className="text-muted-foreground">
            Visualize ARGO oceanographic data with interactive charts
          </p>
        </div>
        <Button
          onClick={() => fetchChartData(selectedChart)}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Chart Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentChartOption && <currentChartOption.icon className="h-5 w-5" />}
            Select Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHART_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={selectedChart === option.value ? "default" : "outline"}
                className={`p-4 h-auto text-left ${
                  selectedChart === option.value ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedChart(option.value)}
              >
                <div className="flex items-start gap-3">
                  <option.icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Chart Display */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{chartData?.config.title || "Loading..."}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {chartData?.config.description || "Fetching chart data..."}
              </p>
            </div>
            {chartData?.lastUpdated && (
              <Badge variant="secondary" className="text-xs">
                Updated: {new Date(chartData.lastUpdated).toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Chart Statistics */}
      {chartData?.data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold">
                  {selectedChart === 'global-distribution' && chartData.data.total}
                  {selectedChart === 'data-mode-pie' && chartData.data.total}
                  {selectedChart === 'temperature-trends' && chartData.data.trends?.length}
                  {selectedChart === 'salinity-depth' && chartData.data.profile?.length}
                  {selectedChart === 'ts-scatter' && chartData.data.points?.length}
                  {selectedChart === 'pressure-distribution' && chartData.data.distribution?.length}
                  {selectedChart === 'deployments-timeline' && chartData.data.timeline?.length}
                  {selectedChart === 'regional-distribution' && chartData.data.regions?.length}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedChart === 'global-distribution' && 'Total Floats'}
                {selectedChart === 'data-mode-pie' && 'Total Data Points'}
                {selectedChart === 'temperature-trends' && 'Time Periods'}
                {selectedChart === 'salinity-depth' && 'Depth Bins'}
                {selectedChart === 'ts-scatter' && 'Data Points'}
                {selectedChart === 'pressure-distribution' && 'Depth Ranges'}
                {selectedChart === 'deployments-timeline' && 'Years Covered'}
                {selectedChart === 'regional-distribution' && 'Regions'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">
                {chartData.success ? '✓' : '✗'}
              </div>
              <p className="text-xs text-muted-foreground">
                {chartData.success ? 'Data Loaded' : 'Load Failed'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {chartData.config.type.toUpperCase()}
              </div>
              <p className="text-xs text-muted-foreground">Chart Type</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}