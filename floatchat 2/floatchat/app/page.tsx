"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Dashboard } from "@/components/dashboard"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return <ChatInterface />
      case "about":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-lg p-8 border border-border">
              <h2 className="text-3xl font-bold mb-4">About FloatChat</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  FloatChat is an interactive dashboard for exploring ARGO oceanographic data. ARGO is a global array of
                  autonomous profiling floats that measure temperature, salinity, and other ocean parameters.
                </p>
                <p>This application provides researchers and ocean enthusiasts with tools to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Visualize float locations on interactive maps</li>
                  <li>Analyze temperature and salinity profiles</li>
                  <li>Explore time series data and trends</li>
                  <li>Chat with an AI assistant about oceanographic data</li>
                </ul>
                <p>Built with Next.js, Tailwind CSS, and Recharts for modern, responsive data visualization.</p>
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
