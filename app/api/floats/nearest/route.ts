import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")
    const limit = searchParams.get("limit") || "10"
    const maxDistance = searchParams.get("maxDistance") || "500" // km

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      )
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)
    const maxDistanceKm = parseFloat(maxDistance)
    const resultLimit = parseInt(limit)

    // Find nearest floats using Haversine formula
    const floats = await bigQueryService.getNearestFloats(
      latitude,
      longitude,
      maxDistanceKm,
      resultLimit
    )

    return NextResponse.json({
      searchLocation: { latitude, longitude },
      maxDistance: maxDistanceKm,
      floatsFound: floats.length,
      floats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Nearest floats API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch nearest floats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}