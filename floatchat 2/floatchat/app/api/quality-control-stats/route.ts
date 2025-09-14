import { type NextRequest, NextResponse } from "next/server"
import { getQualityControlStats } from "@/lib/mock-data"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Parse filter parameters (simplified for now)
  const filters = {
    region: searchParams.get("region") || undefined,
    parameter: searchParams.get("parameter") || undefined,
  }

  const qualityStats = getQualityControlStats(filters)

  return NextResponse.json({
    qualityStats,
    lastUpdated: new Date().toISOString(),
  })
}
