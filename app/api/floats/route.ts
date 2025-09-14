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

    // Circular radius filtering
    const centerLat = searchParams.get("centerLat")
    const centerLon = searchParams.get("centerLon")
    const radiusKm = searchParams.get("radiusKm")
    if (centerLat && centerLon && radiusKm) {
      if (!filters.geospatial) filters.geospatial = {}
      filters.geospatial.circularRadius = {
        centerLat: parseFloat(centerLat),
        centerLon: parseFloat(centerLon),
        radiusKm: parseFloat(radiusKm),
      }
    }

    // Measurement range filtering
    const minTemp = searchParams.get("minTemp")
    const maxTemp = searchParams.get("maxTemp")
    const minSalinity = searchParams.get("minSalinity")
    const maxSalinity = searchParams.get("maxSalinity")
    const minDepth = searchParams.get("minDepth")
    const maxDepth = searchParams.get("maxDepth")

    if (minTemp || maxTemp || minSalinity || maxSalinity || minDepth || maxDepth) {
      filters.measurements = {}
      if (minTemp || maxTemp) {
        filters.measurements.temperatureRange = {
          min: minTemp ? parseFloat(minTemp) : -10,
          max: maxTemp ? parseFloat(maxTemp) : 40,
        }
      }
      if (minSalinity || maxSalinity) {
        filters.measurements.salinityRange = {
          min: minSalinity ? parseFloat(minSalinity) : 0,
          max: maxSalinity ? parseFloat(maxSalinity) : 50,
        }
      }
      if (minDepth || maxDepth) {
        filters.measurements.depthRange = {
          min: minDepth ? parseFloat(minDepth) : 0,
          max: maxDepth ? parseFloat(maxDepth) : 6000,
        }
      }
    }

    // Platform filtering
    const platformNumbers = searchParams.get("platformNumbers")
    const dataCenter = searchParams.get("dataCenter")
    const projectName = searchParams.get("projectName")
    const dataMode = searchParams.get("dataMode")

    if (platformNumbers || dataCenter || projectName || dataMode) {
      filters.platform = {}
      if (platformNumbers) {
        filters.platform.platformNumbers = platformNumbers.split(",")
      }
      if (dataCenter) filters.platform.dataCenter = dataCenter
      if (projectName) filters.platform.projectName = projectName
      if (dataMode) filters.platform.dataMode = dataMode
    }

    // Quality control filtering
    const goodOnly = searchParams.get("goodOnly") === "true"
    const includeQuestionable = searchParams.get("includeQuestionable") === "true"
    if (goodOnly || includeQuestionable) {
      filters.qualityControl = {
        goodOnly,
        includeQuestionable,
      }
    }

    // Fetch data from BigQuery
    const [floats, statistics] = await Promise.all([
      bigQueryService.getFloats(filters),
      bigQueryService.getStatistics(filters),
    ])

    return NextResponse.json({
      floats,
      statistics,
      total: floats.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Floats API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch float data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
