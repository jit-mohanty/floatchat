"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import L from "leaflet"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import {
  Globe,
  RefreshCw,
  BarChart3,
  LineChart as LineIcon
} from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1",
  "#d084d0", "#87ceeb", "#ffb347", "#98fb98", "#f0e68c"
]

const CHART_OPTIONS = [
  { value: "global-distribution", label: "🌍 Global Float Distribution", icon: Globe },
  { value: "temperature-trends", label: "🌡️ Temperature Trends", icon: LineIcon },
  { value: "pressure-distribution", label: "📏 Depth Distribution", icon: BarChart3 },
  { value: "deployments-timeline", label: "📅 Deployments Timeline", icon: BarChart3 },
  { value: "regional-distribution", label: "🌐 Regional Distribution", icon: BarChart3 }
]

// --- MOCK DATA ---
const mockData: any = {
  "global-distribution": {
    total: 80,
    floats: Array.from({ length: 80 }).map((_, i) => ({
      id: i + 1,
      lat: Math.random() * 20 - 10,    // Latitudes around Indian Ocean
      lon: Math.random() * 40 + 60,    // Longitudes around Indian Ocean
      status: ["Realtime", "Adjusted", "Delayed"][Math.floor(Math.random() * 3)]
    }))
  },
  "temperature-trends": {
    trends: Array.from({ length: 60 }).map((_, i) => {
      const year = 2021 + Math.floor(i / 12)
      const month = (i % 12) + 1
      return {
        month: `${year}-${String(month).padStart(2, "0")}`,
        "Indian Ocean": +(25 + Math.random() * 3).toFixed(1),
        "Bay of Bengal": +(27 + Math.random() * 2).toFixed(1),
        "Arabian Sea": +(26 + Math.random() * 2.5).toFixed(1)
      }
    })
  },
  "pressure-distribution": {
    distribution: [
      { depth_range: "0-50", count: 12 },
      { depth_range: "50-100", count: 18 },
      { depth_range: "100-200", count: 22 },
      { depth_range: "200-500", count: 16 },
      { depth_range: "500+", count: 12 }
    ]
  },
  "deployments-timeline": {
    timeline: [
      { year: 2020, profiles: 12, floats: 6 },
      { year: 2021, profiles: 18, floats: 9 },
      { year: 2022, profiles: 20, floats: 10 },
      { year: 2023, profiles: 25, floats: 12 },
      { year: 2024, profiles: 30, floats: 15 }
    ]
  },
  "regional-distribution": {
    regions: [
      { region: "Arabian Sea", float_count: 25 },
      { region: "Bay of Bengal", float_count: 22 },
      { region: "Indian Ocean South", float_count: 18 },
      { region: "Maldives", float_count: 15 }
    ]
  }
}

// ✅ Custom Location Icon with darker shadow
const locationIcon = new L.DivIcon({
  html: `
    <div style="position: relative; display:flex; align-items:center; justify-content:center;">
      <!-- Red Pin -->
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
           fill="currentColor" viewBox="0 0 24 24" style="color:#ef4444; z-index:2;">
        <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>

      <!-- Darker Glowing Shadow -->
      <div style="
        position: absolute;
        bottom: -6px;
        width: 16px;
        height: 7px;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 50%;
        filter: blur(6px);
        opacity: 0.7;
        z-index: 1;
      "></div>
    </div>
  `,
  className: "",
  iconSize: [24, 32],
  iconAnchor: [12, 32],
  popupAnchor: [0, -32]
})
  
export function ChartDashboard() {
  const [selectedChart, setSelectedChart] = useState<string>("global-distribution")

  const renderChart = () => {
    const data = mockData[selectedChart]
    switch (selectedChart) {
      case "global-distribution":
        return (
          <MapContainer center={[5, 80]} zoom={4} style={{ height: 400, width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {data.floats.map((f: any) => (
              <Marker key={f.id} position={[f.lat, f.lon]} icon={locationIcon}>
                <Popup>
                  Float ID: {f.id} <br /> Status: {f.status}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )
      case "temperature-trends":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                interval={11} // one tick per year
              />
              <YAxis label={{ value: "Temp (°C)", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              {["Indian Ocean", "Bay of Bengal", "Arabian Sea"].map((region, i) => (
                <Line
                  key={region}
                  dataKey={region}
                  stroke={COLORS[i]}
                  strokeWidth={1.8}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )
      case "pressure-distribution":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="depth_range" />
              <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )
      case "deployments-timeline":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="profiles" fill="#8884d8" name="Profiles" />
              <Bar dataKey="floats" fill="#82ca9d" name="Floats" />
            </BarChart>
          </ResponsiveContainer>
        )
      case "regional-distribution":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.regions} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="region" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="float_count" fill="#ff7c7c" />
            </BarChart>
          </ResponsiveContainer>
        )
      default:
        return <p>No chart available</p>
    }
  }

  const currentData = mockData[selectedChart]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">ARGO Mock Dashboard</h2>
          <p className="text-muted-foreground">
            Explore ARGO oceanographic trends using mock data
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Chart Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {CHART_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={selectedChart === opt.value ? "default" : "outline"}
            className={`p-4 text-left ${
              selectedChart === opt.value ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedChart(opt.value)}
          >
            <div className="flex items-center gap-2">
              <opt.icon className="h-5 w-5" />
              <span>{opt.label}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{CHART_OPTIONS.find((c) => c.value === selectedChart)?.label}</CardTitle>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">
              {selectedChart === "global-distribution" && currentData.total}
              {selectedChart === "temperature-trends" && currentData.trends.length}
              {selectedChart === "pressure-distribution" && currentData.distribution.length}
              {selectedChart === "deployments-timeline" && currentData.timeline.length}
              {selectedChart === "regional-distribution" && currentData.regions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedChart === "global-distribution" && "Total Floats"}
              {selectedChart === "temperature-trends" && "Months"}
              {selectedChart === "pressure-distribution" && "Depth Ranges"}
              {selectedChart === "deployments-timeline" && "Years"}
              {selectedChart === "regional-distribution" && "Regions"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-600">✓</div>
            <p className="text-xs text-muted-foreground">Data Loaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">MOCK</div>
            <p className="text-xs text-muted-foreground">Data Type</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
