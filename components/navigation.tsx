"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Waves, BarChart3, Info, PieChart } from "lucide-react"

interface NavigationProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function Navigation({ activeTab = "dashboard", onTabChange }: NavigationProps) {
  const [internalActiveTab, setInternalActiveTab] = useState("dashboard")

  // Use external state if provided, otherwise use internal state
  const currentTab = activeTab
  const handleTabChange = onTabChange || setInternalActiveTab

  const navItems = [
    { id: "dashboard", label: "Data Browser", icon: BarChart3 },
    { id: "charts", label: "Charts", icon: PieChart },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "about", label: "About", icon: Info },
  ]

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Waves className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">ARGO Explorer</h1>
            <span className="text-sm text-muted-foreground">Indian Ocean Data Dashboard</span>
          </div>

          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentTab === item.id ? "default" : "ghost"}
                  onClick={() => handleTabChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
