import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService, type BigQueryFilters } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse filter parameters for BigQuery
    const filters: BigQueryFilters = {}

    // Date range filtering
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    if (startDate || endDate) {
      filters.dateRange = {}
      if (startDate) filters.dateRange.start = startDate
      if (endDate) filters.dateRange.end = endDate
    }

    // Platform filtering
    const dataCenter = searchParams.get("dataCenter")
    const projectName = searchParams.get("projectName")
    const dataMode = searchParams.get("dataMode")
    if (dataCenter || projectName || dataMode) {
      filters.platform = {}
      if (dataCenter) filters.platform.dataCenter = dataCenter
      if (projectName) filters.platform.projectName = projectName
      if (dataMode) filters.platform.dataMode = dataMode
    }

    // Geospatial filtering
    const minLat = searchParams.get("minLat")
    const maxLat = searchParams.get("maxLat")
    const minLon = searchParams.get("minLon")
    const maxLon = searchParams.get("maxLon")
    if (minLat && maxLat && minLon && maxLon) {
      filters.geospatial = {
        boundingBox: {
          minLat: parseFloat(minLat),
          maxLat: parseFloat(maxLat),
          minLon: parseFloat(minLon),
          maxLon: parseFloat(maxLon),
        },
      }
    }

    // Fetch quality control stats from BigQuery
    const qualityStats = await bigQueryService.getQualityControlStats(filters)

    return NextResponse.json({
      qualityStats,
      filters: filters,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Quality control stats API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch quality control statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
