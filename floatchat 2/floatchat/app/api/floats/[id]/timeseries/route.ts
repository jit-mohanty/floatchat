import { type NextRequest, NextResponse } from "next/server"
import { getFloatTimeSeries } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const floatId = params.id
  const searchParams = request.nextUrl.searchParams

  const startDate = searchParams.get("start")
  const endDate = searchParams.get("end")

  let timeSeries = getFloatTimeSeries(floatId)

  // Apply date filtering if provided
  if (startDate || endDate) {
    timeSeries = timeSeries.filter((data) => {
      const dataDate = new Date(data.date)
      if (startDate && dataDate < new Date(startDate)) return false
      if (endDate && dataDate > new Date(endDate)) return false
      return true
    })
  }

  if (timeSeries.length === 0) {
    return NextResponse.json({ error: "No time series data found for this float" }, { status: 404 })
  }

  return NextResponse.json({
    floatId,
    timeSeries,
    dataPoints: timeSeries.length,
    lastUpdated: new Date().toISOString(),
  })
}
