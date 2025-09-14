import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    console.log('Testing simple BigQuery connection...')

    // Very simple test - just count profiles
    const simpleQuery = `
      SELECT COUNT(*) as total_count
      FROM \`argo-472010.argo_full.profiles\`
      LIMIT 1
    `

    console.log('Executing query:', simpleQuery)
    const result = await bigQueryService.executeQuery(simpleQuery)
    console.log('Query result:', result)

    return NextResponse.json({
      success: true,
      result: result,
      message: "Simple BigQuery test completed"
    })

  } catch (error) {
    console.error("Simple BigQuery test error:", error)
    return NextResponse.json(
      {
        error: "Failed to test BigQuery",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}