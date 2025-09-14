import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const platformNumber = params.id

    if (!platformNumber || platformNumber === "undefined" || platformNumber === "null") {
      return NextResponse.json({ error: "Invalid platform number provided" }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams

    // Parse date range parameters
    const dateRange: { start?: string; end?: string } = {}
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    if (startDate) dateRange.start = startDate
    if (endDate) dateRange.end = endDate

    // Fetch trajectory data from BigQuery
    const trajectory = await bigQueryService.getFloatTrajectory(
      platformNumber,
      Object.keys(dateRange).length > 0 ? dateRange : undefined
    )

    if (!trajectory || trajectory.length === 0) {
      return NextResponse.json({
        floatId: platformNumber,
        trajectory: [],
        dataPoints: 0,
        lastUpdated: new Date().toISOString(),
        message: "No trajectory data available for this float",
      })
    }

    return NextResponse.json({
      floatId: platformNumber,
      trajectory,
      dataPoints: trajectory.length,
      dateRange: dateRange,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Trajectory API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch trajectory data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
