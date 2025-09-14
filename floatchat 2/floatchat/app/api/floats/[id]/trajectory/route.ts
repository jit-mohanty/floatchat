import { type NextRequest, NextResponse } from "next/server"
import { getFloatTrajectory } from "@/lib/mock-data"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const floatId = params.id

  if (!floatId || floatId === "undefined" || floatId === "null") {
    return NextResponse.json({ error: "Invalid float ID provided" }, { status: 400 })
  }

  const searchParams = request.nextUrl.searchParams
  const startDate = searchParams.get("start")
  const endDate = searchParams.get("end")

  let trajectory = getFloatTrajectory(floatId)

  if (!trajectory || trajectory.length === 0) {
    return NextResponse.json({
      floatId,
      trajectory: [],
      dataPoints: 0,
      lastUpdated: new Date().toISOString(),
      message: "No trajectory data available for this float",
    })
  }

  // Apply date filtering if provided
  if (startDate || endDate) {
    trajectory = trajectory.filter((point) => {
      const pointDate = new Date(point.date)
      if (startDate && pointDate < new Date(startDate)) return false
      if (endDate && pointDate > new Date(endDate)) return false
      return true
    })
  }

  return NextResponse.json({
    floatId,
    trajectory,
    dataPoints: trajectory.length,
    lastUpdated: new Date().toISOString(),
  })
}
