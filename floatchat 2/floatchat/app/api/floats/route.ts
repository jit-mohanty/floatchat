import { type NextRequest, NextResponse } from "next/server"
import { mockFloats, filterFloats, calculateStatistics, type FilterOptions } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Parse filter parameters
  const filters: FilterOptions = {
    region: searchParams.get("region") || undefined,
    parameter: searchParams.get("parameter") || undefined,
    status: {
      active: searchParams.get("active") !== "false",
      inactive: searchParams.get("inactive") !== "false",
    },
    depthRange: {
      min: Number(searchParams.get("minDepth")) || 0,
      max: Number(searchParams.get("maxDepth")) || 2000,
    },
  }

  // Apply filters
  const filteredFloats = filterFloats(mockFloats, filters)
  const statistics = calculateStatistics(filteredFloats)

  return NextResponse.json({
    floats: filteredFloats,
    statistics,
    total: filteredFloats.length,
  })
}
