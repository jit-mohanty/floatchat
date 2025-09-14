import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

// Predefined ocean regions for Indian Ocean focus (per problem statement)
const OCEAN_REGIONS = {
  "arabian-sea": {
    name: "Arabian Sea",
    bounds: { minLat: 0, maxLat: 25, minLon: 50, maxLon: 75 }
  },
  "bay-of-bengal": {
    name: "Bay of Bengal",
    bounds: { minLat: 5, maxLat: 23, minLon: 80, maxLon: 95 }
  },
  "southern-indian": {
    name: "Southern Indian Ocean",
    bounds: { minLat: -60, maxLat: -20, minLon: 20, maxLon: 120 }
  },
  "equatorial-indian": {
    name: "Equatorial Indian Ocean",
    bounds: { minLat: -10, maxLat: 10, minLon: 40, maxLon: 100 }
  },
  "western-indian": {
    name: "Western Indian Ocean",
    bounds: { minLat: -40, maxLat: 0, minLon: 30, maxLon: 60 }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const regions = searchParams.get("regions")?.split(",") || Object.keys(OCEAN_REGIONS)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const depthRange = searchParams.get("depthRange") || "0-100" // Surface by default

    const [minDepth, maxDepth] = depthRange.split("-").map(d => parseFloat(d))

    // Get comparison data for each region
    const comparisons = await Promise.all(
      regions.map(async (regionKey) => {
        const region = OCEAN_REGIONS[regionKey as keyof typeof OCEAN_REGIONS]
        if (!region) return null

        const stats = await bigQueryService.getRegionalStatistics(
          region.bounds,
          { start: startDate, end: endDate },
          { min: minDepth, max: maxDepth }
        )

        return {
          region: region.name,
          bounds: region.bounds,
          ...stats
        }
      })
    )

    // Filter out null results
    const validComparisons = comparisons.filter(c => c !== null)

    return NextResponse.json({
      regions: validComparisons,
      dateRange: { start: startDate, end: endDate },
      depthRange: { min: minDepth, max: maxDepth },
      comparisonDate: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Regional comparison API error:", error)
    return NextResponse.json(
      {
        error: "Failed to compare regions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}