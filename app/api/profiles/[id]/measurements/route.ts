import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profileId = params.id

    // Validate profile ID
    if (!profileId || isNaN(parseInt(profileId))) {
      return NextResponse.json(
        { error: "Invalid profile ID" },
        { status: 400 }
      )
    }

    console.log(`Fetching measurements for profile ${profileId}...`)

    // Get profile info first to validate it exists
    const profileQuery = `
      SELECT
        p.profile_id,
        p.platform_number,
        p.cycle_number,
        p.latitude,
        p.longitude,
        p.date_creation
      FROM \`argo-472010.argo_full.profiles\` p
      WHERE p.profile_id = ${parseInt(profileId)}
      LIMIT 1
    `

    const profileResult = await bigQueryService.executeQuery(profileQuery)
    
    if (profileResult.length === 0) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    // Main measurements query  
    const measurementsQuery = `
      SELECT
        m.level_index,
        m.pres_adjusted,
        m.temp_adjusted,
        m.psal_adjusted,
        m.temp_qc,
        m.psal_qc,
        m.pres_qc,
        m.temp_adjusted_error,
        m.psal_adjusted_error,
        m.pres_adjusted_error
      FROM \`argo-472010.argo_full.measurements\` m
      WHERE m.profile_id = ${parseInt(profileId)}
      ORDER BY m.level_index ASC
      LIMIT 1000
    `

    const measurements = await bigQueryService.executeQuery(measurementsQuery)

    console.log(`Found ${measurements.length} measurements for profile ${profileId}`)

    return NextResponse.json({
      profile: profileResult[0],
      measurements: measurements.map((m: any, index: number) => ({
        measurement_id: index + 1,
        level_index: m.level_index,
        pres_adjusted: m.pres_adjusted,
        temp_adjusted: m.temp_adjusted,
        psal_adjusted: m.psal_adjusted,
        temp_qc: m.temp_qc || '1',
        psal_qc: m.psal_qc || '1',
        pres_qc: m.pres_qc || '1',
        temp_adjusted_error: m.temp_adjusted_error,
        psal_adjusted_error: m.psal_adjusted_error,
        pres_adjusted_error: m.pres_adjusted_error
      })),
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error(`Measurements API error for profile ${params.id}:`, error)
    return NextResponse.json(
      {
        error: "Failed to fetch measurements",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
