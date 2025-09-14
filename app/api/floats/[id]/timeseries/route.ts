import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const platformNumber = params.id
    const searchParams = request.nextUrl.searchParams

    if (!platformNumber) {
      return NextResponse.json({ error: "Platform number is required" }, { status: 400 })
    }

    // Parse date range parameters
    const dateRange: { start?: string; end?: string } = {}
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    if (startDate) dateRange.start = startDate
    if (endDate) dateRange.end = endDate

    // Fetch time series data from BigQuery
    const timeSeries = await bigQueryService.getFloatTimeSeries(
      platformNumber,
      Object.keys(dateRange).length > 0 ? dateRange : undefined
    )

    if (timeSeries.length === 0) {
      return NextResponse.json({ error: "No time series data found for this float" }, { status: 404 })
    }

    return NextResponse.json({
      floatId: platformNumber,
      timeSeries,
      dataPoints: timeSeries.length,
      dateRange: dateRange,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Time series API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch time series data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
