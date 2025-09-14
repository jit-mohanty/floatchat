import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const platformNumber = params.id

    if (!platformNumber) {
      return NextResponse.json({ error: "Platform number is required" }, { status: 400 })
    }

    // Fetch profile data from BigQuery
    const profile = await bigQueryService.getFloatProfile(platformNumber)

    if (!profile.depth.length) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      floatId: platformNumber,
      profile,
      dataPoints: profile.depth.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch profile data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
