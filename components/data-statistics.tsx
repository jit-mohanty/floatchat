"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Database,
  Globe,
  Calendar,
  MapPin,
  Activity,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react"

interface DataStatistics {
  totalProfiles: number
  totalMeasurements: number
  totalPlatforms: number
  dataQuality: {
    good: number
    probablyGood: number
    probablyBad: number
    bad: number
  }
  dataCentres: Record<string, number>
  dataModes: {
    realtime: number
    adjusted: number
    delayed: number
  }
  platformTypes: Record<string, number>
  projects: Record<string, number>
  temporalDistribution: {
    currentYear: number
    lastYear: number
    older: number
  }
  geographicCoverage: {
    latRange: { min: number; max: number }
    lonRange: { min: number; max: number }
    regions: Record<string, number>
  }
}

export function DataStatistics() {
  const [stats, setStats] = useState<DataStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock statistics generation based on schema
  useEffect(() => {
    const generateMockStats = (): DataStatistics => {
      return {
        totalProfiles: 125847,
        totalMeasurements: 18547832,
        totalPlatforms: 1243,
        dataQuality: {
          good: 89234,
          probablyGood: 15678,
          probablyBad: 12834,
          bad: 8101
        },
        dataCentres: {
          'AO': 28456,
          'IF': 23789,
          'CS': 19234,
          'BO': 18956,
          'HZ': 15678,
          'JA': 12456,
          'KM': 7278
        },
        dataModes: {
          realtime: 45234,
          adjusted: 56789,
          delayed: 23824
        },
        platformTypes: {
          'APEX': 35678,
          'NAVIS_EBR': 28945,
          'ARVOR': 21456,
          'NOVA': 18967,
          'PROVOR': 12234,
          'Others': 8567
        },
        projects: {
          'Argo_INDIA': 34567,
          'Argo_eq_PACIFIC': 23456,
          'RAMA': 19234,
          'PIRATA': 15678,
          'SOSCUEx': 12345,
          'Others': 20567
        },
        temporalDistribution: {
          currentYear: 45678,
          lastYear: 56789,
          older: 23380
        },
        geographicCoverage: {
          latRange: { min: -60.45, max: 30.67 },
          lonRange: { min: 20.12, max: 120.89 },
          regions: {
            'Arabian Sea': 34567,
            'Bay of Bengal': 28945,
            'Southern Indian Ocean': 31234,
            'Equatorial Indian Ocean': 19456,
            'Western Indian Ocean': 11645
          }
        }
      }
    }

    // Simulate API delay
    setTimeout(() => {
      setStats(generateMockStats())
      setLoading(false)
    }, 800)
  }, [])

  const getQualityPercentage = (count: number, total: number) => {
    return ((count / total) * 100).toFixed(1)
  }

  const getDataCentreLabel = (code: string) => {
    const labels: Record<string, string> = {
      'AO': 'Australia',
      'IF': 'India',
      'CS': 'Canada',
      'BO': 'France',
      'HZ': 'Japan (JAMSTEC)',
      'JA': 'Japan (JMA)',
      'KM': 'Korea'
    }
    return labels[code] || code
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-6 bg-muted animate-pulse rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const totalQuality = stats.dataQuality.good + stats.dataQuality.probablyGood +
                      stats.dataQuality.probablyBad + stats.dataQuality.bad

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Database Statistics</h2>
          <p className="text-muted-foreground">ARGO Profile Data Overview</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalProfiles.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Profiles</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalMeasurements.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Measurements</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalPlatforms.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Platforms</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <div>
                <div className="text-2xl font-bold">
                  {getQualityPercentage(stats.dataQuality.good, totalQuality)}%
                </div>
                <div className="text-xs text-muted-foreground">Good Quality</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quality" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="centers">Data Centres</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="temporal">Temporal</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
        </TabsList>

        {/* Data Quality Tab */}
        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Data Quality Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Good Quality (QC=1)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      {stats.dataQuality.good.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {getQualityPercentage(stats.dataQuality.good, totalQuality)}%
                    </span>
                  </div>
                </div>
                <Progress value={parseFloat(getQualityPercentage(stats.dataQuality.good, totalQuality))} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Probably Good (QC=2)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.dataQuality.probablyGood.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {getQualityPercentage(stats.dataQuality.probablyGood, totalQuality)}%
                    </span>
                  </div>
                </div>
                <Progress value={parseFloat(getQualityPercentage(stats.dataQuality.probablyGood, totalQuality))} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Probably Bad (QC=3)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-orange-100 text-orange-800">
                      {stats.dataQuality.probablyBad.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {getQualityPercentage(stats.dataQuality.probablyBad, totalQuality)}%
                    </span>
                  </div>
                </div>
                <Progress value={parseFloat(getQualityPercentage(stats.dataQuality.probablyBad, totalQuality))} className="h-2" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Bad Quality (QC=4)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-red-100 text-red-800">
                      {stats.dataQuality.bad.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {getQualityPercentage(stats.dataQuality.bad, totalQuality)}%
                    </span>
                  </div>
                </div>
                <Progress value={parseFloat(getQualityPercentage(stats.dataQuality.bad, totalQuality))} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Data Mode Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Data Mode Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Real-time</span>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {stats.dataModes.realtime.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getQualityPercentage(stats.dataModes.realtime, stats.totalProfiles)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Adjusted</span>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      {stats.dataModes.adjusted.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getQualityPercentage(stats.dataModes.adjusted, stats.totalProfiles)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Delayed</span>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {stats.dataModes.delayed.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getQualityPercentage(stats.dataModes.delayed, stats.totalProfiles)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Centres Tab */}
        <TabsContent value="centers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Data Centres Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.dataCentres)
                  .sort(([, a], [, b]) => b - a)
                  .map(([code, count]) => (
                    <div key={code} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{code}</Badge>
                        <span className="text-sm">{getDataCentreLabel(code)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">{count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {getQualityPercentage(count, stats.totalProfiles)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Types Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Platform Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.platformTypes)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{type}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">{count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {getQualityPercentage(count, stats.totalProfiles)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Research Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(stats.projects)
                  .sort(([, a], [, b]) => b - a)
                  .map(([project, count]) => (
                    <div key={project} className="flex items-center justify-between">
                      <span className="text-sm">{project}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">{count.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {getQualityPercentage(count, stats.totalProfiles)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temporal Distribution Tab */}
        <TabsContent value="temporal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Temporal Distribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Year (2024)</span>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {stats.temporalDistribution.currentYear.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getQualityPercentage(stats.temporalDistribution.currentYear, stats.totalProfiles)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={parseFloat(getQualityPercentage(stats.temporalDistribution.currentYear, stats.totalProfiles))}
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Last Year (2023)</span>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      {stats.temporalDistribution.lastYear.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getQualityPercentage(stats.temporalDistribution.lastYear, stats.totalProfiles)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={parseFloat(getQualityPercentage(stats.temporalDistribution.lastYear, stats.totalProfiles))}
                  className="h-2"
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm">Older (2022 and before)</span>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gray-100 text-gray-800">
                      {stats.temporalDistribution.older.toLocaleString()}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {getQualityPercentage(stats.temporalDistribution.older, stats.totalProfiles)}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={parseFloat(getQualityPercentage(stats.temporalDistribution.older, stats.totalProfiles))}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Coverage Tab */}
        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Geographic Coverage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Latitude Range</div>
                    <div className="font-mono text-sm">
                      {stats.geographicCoverage.latRange.min.toFixed(2)}° to {stats.geographicCoverage.latRange.max.toFixed(2)}°
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Longitude Range</div>
                    <div className="font-mono text-sm">
                      {stats.geographicCoverage.lonRange.min.toFixed(2)}° to {stats.geographicCoverage.lonRange.max.toFixed(2)}°
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-sm font-medium">Regional Distribution</div>
                  {Object.entries(stats.geographicCoverage.regions)
                    .sort(([, a], [, b]) => b - a)
                    .map(([region, count]) => (
                      <div key={region} className="flex items-center justify-between">
                        <span className="text-sm">{region}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono">{count.toLocaleString()}</span>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {getQualityPercentage(count, stats.totalProfiles)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Database contains {stats.totalProfiles.toLocaleString()} profiles from {stats.totalPlatforms.toLocaleString()} platforms</span>
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}