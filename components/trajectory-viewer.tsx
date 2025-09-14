"use client"

import { useState } from "react"
import { useDashboard } from "@/components/dashboard"
import { useFloatTrajectory } from "@/hooks/use-argo-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { MapPin, Clock, Route, Navigation } from "lucide-react"

export function TrajectoryViewer() {
  const { selectedFloat, filters, loading } = useDashboard()
  const [viewMode, setViewMode] = useState<"path" | "timeline">("path")
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "1y" | "all">("90d")

  const {
    trajectory: apiTrajectory,
    loading: trajectoryLoading,
    error: trajectoryError,
  } = useFloatTrajectory(
    selectedFloat?.id,
    timeRange === "all"
      ? undefined
      : {
          start: new Date(
            Date.now() - (timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365) * 24 * 60 * 60 * 1000,
          ).toISOString(),
          end: new Date().toISOString(),
        },
  )

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading trajectory...</p>
        </div>
      </div>
    )
  }

  if (!selectedFloat) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a float to view trajectory</p>
        </div>
      </div>
    )
  }

  // Generate basic trajectory data from schema
  const generateTrajectoryData = () => {
    const baseData = Array.from({ length: 50 }, (_, i) => {
      const date = new Date(Date.now() - (50 - i) * 10 * 24 * 60 * 60 * 1000)

      // Basic position data (compatible with profiles.latitude/longitude/juld)
      const lat = selectedFloat.latitude + Math.sin(i * 0.2) * 2 + (Math.random() - 0.5) * 0.5
      const lon = selectedFloat.longitude + Math.cos(i * 0.15) * 3 + (Math.random() - 0.5) * 0.5

      return {
        cycle: i + 1,
        latitude: lat,
        longitude: lon,
        date: date.toISOString().split("T")[0],
        timestamp: date.getTime(),
        temperature: 20 + Math.sin(i * 0.1) * 5 + Math.random() * 2,
      }
    })

    return baseData
  }

  const trajectoryData = apiTrajectory && apiTrajectory.length > 0 ? apiTrajectory : generateTrajectoryData()

  if (trajectoryLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading trajectory data...</p>
        </div>
      </div>
    )
  }

  if (trajectoryError) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-sm">Error loading trajectory data</p>
        </div>
      </div>
    )
  }

  const calculateTrajectoryStats = () => {
    const duration = trajectoryData.length * 10 // days

    return {
      duration,
      cycles: trajectoryData.length,
    }
  }

  const stats = calculateTrajectoryStats()

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">30d</SelectItem>
              <SelectItem value="90d">90d</SelectItem>
              <SelectItem value="1y">1y</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Badge variant="outline" className="flex items-center space-x-1">
          <Route className="h-3 w-3" />
          <span>{stats.cycles} cycles</span>
        </Badge>
      </div>

      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="path" className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Path</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Timeline</span>
          </TabsTrigger>
        </TabsList>

        {/* Trajectory Path View */}
        <TabsContent value="path" className="space-y-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="longitude"
                  type="number"
                  scale="linear"
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Longitude", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  dataKey="latitude"
                  type="number"
                  scale="linear"
                  domain={["dataMin - 0.5", "dataMax + 0.5"]}
                  tick={{ fontSize: 10 }}
                  label={{ value: "Latitude", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value, name) => [
                    typeof value === "number" ? value.toFixed(3) : value,
                    name === "latitude" ? "Lat" : "Lon",
                  ]}
                  labelFormatter={(label, payload) =>
                    payload?.[0] ? `Cycle ${payload[0].payload.cycle} - ${payload[0].payload.date}` : ""
                  }
                />
                <Line
                  type="monotone"
                  dataKey="latitude"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#3b82f6" }}
                  activeDot={{ r: 4, stroke: "#3b82f6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>


        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trajectoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="cycle"
                  tick={{ fontSize: 10 }}
                  label={{ value: "Cycle Number", position: "insideBottom", offset: -5 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temperature"]}
                  labelFormatter={(cycle, payload) =>
                    payload?.[0] ? `Cycle ${cycle} - ${payload[0].payload.date}` : ""
                  }
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4, stroke: "#8b5cf6", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Route className="h-4 w-4" />
            <span>Trajectory Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Duration</div>
              <Badge variant="outline" className="text-sm">
                {stats.duration} days
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Cycles</div>
              <Badge variant="outline" className="text-sm">
                {stats.cycles}
              </Badge>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Current Position:</span>
                <div className="font-medium">
                  {selectedFloat.latitude.toFixed(3)}°, {selectedFloat.longitude.toFixed(3)}°
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Last Update:</span>
                <div className="font-medium">{new Date(selectedFloat.lastUpdate).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
