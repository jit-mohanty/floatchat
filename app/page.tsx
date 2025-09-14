"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { DataStatistics } from "@/components/data-statistics"
import { ChartDashboard } from "@/components/chart-dashboard"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "charts":
        return <ChartDashboard />
      case "statistics":
        return <DataStatistics />
      case "about":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-3xl font-bold mb-4">About ARGO Explorer</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  ARGO Explorer is a data-centric browser for exploring massive ARGO oceanographic datasets from the Indian Ocean. ARGO is a global array of
                  autonomous profiling floats that measure temperature, salinity, and pressure parameters.
                </p>
                <p>This application provides researchers with powerful tools to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Browse and filter millions of profile records efficiently</li>
                  <li>Examine detailed measurement data at different depths</li>
                  <li>Analyze quality control flags and data reliability</li>
                  <li>Export filtered datasets for further analysis</li>
                  <li>View comprehensive database statistics and distributions</li>
                  <li>Visualize data with interactive charts and graphs</li>
                </ul>
                <p>Built for handling large-scale oceanographic data with advanced filtering, sorting, and export capabilities.</p>
              </div>
            </div>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-6">{renderContent()}</main>
    </div>
  )
}