import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    console.log('Testing for duplicate profile IDs...')

    // Check for duplicate profile IDs in profiles table
    const duplicateProfilesQuery = `
      SELECT
        profile_id,
        COUNT(*) as count
      FROM \`argo-472010.argo_full.profiles\`
      GROUP BY profile_id
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `

    // Check some statistics
    const statsQuery = `
      SELECT
        (SELECT COUNT(DISTINCT profile_id) FROM \`argo-472010.argo_full.profiles\`) as unique_profiles_in_profiles_table,
        (SELECT COUNT(*) FROM \`argo-472010.argo_full.profiles\`) as total_profiles_rows,
        (SELECT COUNT(DISTINCT profile_id) FROM \`argo-472010.argo_full.measurements\`) as unique_profiles_in_measurements_table,
        (SELECT COUNT(*) FROM \`argo-472010.argo_full.measurements\`) as total_measurements_rows
    `

    console.log('Executing duplicate check queries...')

    const [duplicatesResult, statsResult] = await Promise.all([
      bigQueryService.executeQuery(duplicateProfilesQuery),
      bigQueryService.executeQuery(statsQuery)
    ])

    return NextResponse.json({
      success: true,
      results: {
        duplicate_profiles: duplicatesResult,
        statistics: statsResult[0] || {},
        has_duplicates: duplicatesResult.length > 0
      },
      message: "Duplicate check completed"
    })

  } catch (error) {
    console.error("Duplicate test error:", error)
    return NextResponse.json(
      {
        error: "Failed to test duplicates",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}