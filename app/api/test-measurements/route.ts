import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    console.log('Testing measurement count...')

    // Test 1: Total measurements count
    const totalMeasurementsQuery = `
      SELECT COUNT(*) as total_measurements
      FROM \`argo-472010.argo_full.measurements\`
    `

    // Test 2: Count measurements joined with profiles
    const joinedMeasurementsQuery = `
      SELECT COUNT(*) as joined_measurements
      FROM \`argo-472010.argo_full.measurements\` m
      JOIN \`argo-472010.argo_full.profiles\` p ON m.profile_id = p.profile_id
    `

    // Test 3: Get sample data to understand structure
    const sampleQuery = `
      SELECT
        COUNT(DISTINCT m.profile_id) as unique_profiles_in_measurements,
        COUNT(DISTINCT p.profile_id) as unique_profiles,
        COUNT(*) as total_measurement_rows
      FROM \`argo-472010.argo_full.measurements\` m
      LEFT JOIN \`argo-472010.argo_full.profiles\` p ON m.profile_id = p.profile_id
      LIMIT 1
    `

    console.log('Executing measurement count queries...')

    const [totalResult, joinedResult, sampleResult] = await Promise.all([
      bigQueryService.executeQuery(totalMeasurementsQuery),
      bigQueryService.executeQuery(joinedMeasurementsQuery),
      bigQueryService.executeQuery(sampleQuery)
    ])

    return NextResponse.json({
      success: true,
      results: {
        total_measurements: totalResult[0]?.total_measurements || 0,
        joined_measurements: joinedResult[0]?.joined_measurements || 0,
        sample_data: sampleResult[0] || {}
      },
      message: "Measurement count test completed"
    })

  } catch (error) {
    console.error("Measurement test error:", error)
    return NextResponse.json(
      {
        error: "Failed to test measurements",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}