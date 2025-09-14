import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    console.log('Testing BigQuery schema...')

    // Test 1: Simple profile query to check column names
    const profileTest = `
      SELECT *
      FROM \`argo-472010.argo_full.profiles\`
      LIMIT 1
    `

    // Test 2: Simple measurement query to check column names
    const measurementTest = `
      SELECT *
      FROM \`argo-472010.argo_full.measurements\`
      LIMIT 1
    `

    // Test 3: Check table info
    const tableInfoTest = `
      SELECT column_name, data_type
      FROM \`argo-472010.argo_full.INFORMATION_SCHEMA.COLUMNS\`
      WHERE table_name = 'profiles'
      ORDER BY ordinal_position
    `

    const [profileResult, measurementResult, schemaResult] = await Promise.all([
      bigQueryService.executeQuery(profileTest).catch(e => ({ error: e.message })),
      bigQueryService.executeQuery(measurementTest).catch(e => ({ error: e.message })),
      bigQueryService.executeQuery(tableInfoTest).catch(e => ({ error: e.message }))
    ])

    return NextResponse.json({
      success: true,
      tests: {
        profile_sample: profileResult,
        measurement_sample: measurementResult,
        profile_schema: schemaResult
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Schema test error:", error)
    return NextResponse.json(
      {
        error: "Failed to test schema",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}