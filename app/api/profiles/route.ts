import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100) // Max 100 per page
    const offset = (page - 1) * limit

    console.log(`Fetching profiles page ${page}, limit ${limit}, offset ${offset}`)

    // Build filter conditions
    const conditions: string[] = []
    const params: any[] = []

    // General search parameter - searches across multiple fields
    const searchQuery = searchParams.get("search")
    if (searchQuery) {
      conditions.push("(UPPER(platform_number) LIKE UPPER(?) OR UPPER(data_centre) LIKE UPPER(?) OR UPPER(project_name) LIKE UPPER(?) OR UPPER(pi_name) LIKE UPPER(?) OR UPPER(platform_type) LIKE UPPER(?))")
      const searchTerm = `%${searchQuery}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    // Platform number filter
    const platformNumber = searchParams.get("platform_number")
    if (platformNumber) {
      conditions.push("platform_number = ?")
      params.push(platformNumber)
    }

    // Data center filter
    const dataCenter = searchParams.get("data_center")
    if (dataCenter) {
      conditions.push("data_centre = ?")
      params.push(dataCenter)
    }

    // Data mode filter
    const dataMode = searchParams.get("data_mode")
    if (dataMode) {
      conditions.push("data_mode = ?")
      params.push(dataMode)
    }

    // Location bounds filter
    const minLat = searchParams.get("min_lat")
    const maxLat = searchParams.get("max_lat")
    const minLon = searchParams.get("min_lon")
    const maxLon = searchParams.get("max_lon")

    if (minLat && maxLat) {
      conditions.push("latitude BETWEEN ? AND ?")
      params.push(parseFloat(minLat), parseFloat(maxLat))
    }
    if (minLon && maxLon) {
      conditions.push("longitude BETWEEN ? AND ?")
      params.push(parseFloat(minLon), parseFloat(maxLon))
    }

    // Date range filter
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    if (startDate) {
      conditions.push("date_creation >= ?")
      params.push(startDate)
    }
    if (endDate) {
      conditions.push("date_creation <= ?")
      params.push(endDate)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Main query for profiles with pagination
    const profilesQuery = `
      SELECT
        profile_id,
        platform_number,
        cycle_number,
        latitude,
        longitude,
        date_creation,
        data_centre as data_center,
        data_mode,
        platform_type,
        project_name,
        pi_name,
        profile_temp_qc,
        profile_psal_qc,
        profile_pres_qc
      FROM \`argo-472010.argo_full.profiles\`
      ${whereClause}
      ORDER BY date_creation DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    // Count query for total results
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM \`argo-472010.argo_full.profiles\`
      ${whereClause}
    `

    // Measurement count query - count measurements directly to avoid join duplication
    const measurementCountQuery = `
      SELECT COUNT(*) as measurement_count
      FROM \`argo-472010.argo_full.measurements\` m
      WHERE m.profile_id IN (
        SELECT DISTINCT p.profile_id
        FROM \`argo-472010.argo_full.profiles\` p
        ${whereClause}
      )
    `

    console.log('Executing profiles query:', profilesQuery.substring(0, 200) + '...')
    console.log('Executing count query:', countQuery)

    // Execute all queries in parallel
    const [profilesResult, countResult, measurementCountResult] = await Promise.all([
      bigQueryService.executeQuery(profilesQuery, params),
      bigQueryService.executeQuery(countQuery, params),
      bigQueryService.executeQuery(measurementCountQuery, params)
    ])

    const totalCount = countResult[0]?.total_count || 0
    const measurementCount = measurementCountResult[0]?.measurement_count || 0
    const totalPages = Math.ceil(totalCount / limit)

    console.log(`Found ${profilesResult.length} profiles, total: ${totalCount}, measurements: ${measurementCount}`)

    return NextResponse.json({
      profiles: profilesResult,
      pagination: {
        page,
        limit,
        offset,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      statistics: {
        totalProfiles: totalCount,
        totalMeasurements: measurementCount
      },
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error("Profiles API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch profiles",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}