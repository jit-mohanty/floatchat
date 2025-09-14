import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService, dateStringToJulianDay, validateDateRange } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100) // Max 100 per page
    const offset = (page - 1) * limit

    console.log(`Enhanced profiles API: page ${page}, limit ${limit}`)

    // Build filter conditions
    const conditions: string[] = []
    const params: any[] = []

    // General search parameter - searches across multiple fields
    const searchQuery = searchParams.get("search")
    if (searchQuery) {
      conditions.push("(UPPER(p.platform_number) LIKE UPPER(?) OR UPPER(p.data_centre) LIKE UPPER(?) OR UPPER(p.project_name) LIKE UPPER(?) OR UPPER(p.pi_name) LIKE UPPER(?) OR UPPER(p.platform_type) LIKE UPPER(?))")
      const searchTerm = `%${searchQuery}%`
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm)
    }

    // Platform number filter
    const platformNumber = searchParams.get("platform_number")
    if (platformNumber) {
      conditions.push("p.platform_number = ?")
      params.push(platformNumber)
    }

    // Data center filter
    const dataCenter = searchParams.get("data_center")
    if (dataCenter) {
      conditions.push("p.data_centre = ?")
      params.push(dataCenter)
    }

    // Data mode filter
    const dataMode = searchParams.get("data_mode")
    if (dataMode) {
      conditions.push("p.data_mode = ?")
      params.push(dataMode)
    }

    // Platform type filter
    const platformType = searchParams.get("platform_type")
    if (platformType) {
      conditions.push("p.platform_type = ?")
      params.push(platformType)
    }

    // Project name filter
    const projectName = searchParams.get("project_name")
    if (projectName) {
      conditions.push("p.project_name = ?")
      params.push(projectName)
    }

    // Location bounds filter
    const minLat = searchParams.get("min_lat")
    const maxLat = searchParams.get("max_lat")
    const minLon = searchParams.get("min_lon")
    const maxLon = searchParams.get("max_lon")

    if (minLat && maxLat) {
      conditions.push("p.latitude BETWEEN ? AND ?")
      params.push(parseFloat(minLat), parseFloat(maxLat))
    }
    if (minLon && maxLon) {
      conditions.push("p.longitude BETWEEN ? AND ?")
      params.push(parseFloat(minLon), parseFloat(maxLon))
    }

    // Enhanced Date range filtering with Julian day support
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    // Validate date range first
    const dateValidation = validateDateRange(startDate || undefined, endDate || undefined)
    if (!dateValidation.isValid) {
      return NextResponse.json(
        { error: "Invalid date range", message: dateValidation.error },
        { status: 400 }
      )
    }

    if (startDate) {
      try {
        const startJulian = dateStringToJulianDay(startDate)
        conditions.push("p.juld >= ?")
        params.push(startJulian)
      } catch (error) {
        console.warn('Failed to convert start date to Julian day:', error)
        // Fallback to date_creation filtering
        conditions.push("p.date_creation >= ?")
        params.push(new Date(startDate).toISOString())
      }
    }

    if (endDate) {
      try {
        const endJulian = dateStringToJulianDay(endDate)
        conditions.push("p.juld <= ?")
        params.push(endJulian)
      } catch (error) {
        console.warn('Failed to convert end date to Julian day:', error)
        // Fallback to date_creation filtering
        conditions.push("p.date_creation <= ?")
        params.push(new Date(endDate).toISOString())
      }
    }

    // Enhanced Quality Control filtering
    const qualityFilter = searchParams.get("quality_filter")
    if (qualityFilter && qualityFilter !== 'all') {
      switch (qualityFilter) {
        case 'good':
          conditions.push("p.profile_temp_qc = 'A' AND p.profile_psal_qc = 'A' AND p.profile_pres_qc = 'A'")
          break
        case 'real_time':
          conditions.push("p.data_mode = 'R'")
          break
        case 'adjusted':
          conditions.push("p.data_mode = 'A'")
          break
        case 'problematic':
          conditions.push("(p.profile_temp_qc IN ('B', 'C', 'F') OR p.profile_psal_qc IN ('B', 'C', 'F') OR p.profile_pres_qc IN ('B', 'C', 'F'))")
          break
        default:
          // Specific quality flag
          if (['1', '2', '3', '4', '8', '9', 'A', 'B', 'C', 'D', 'F'].includes(qualityFilter)) {
            conditions.push("(p.profile_temp_qc = ? OR p.profile_psal_qc = ? OR p.profile_pres_qc = ?)")
            params.push(qualityFilter, qualityFilter, qualityFilter)
          }
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Sorting options
    const sortBy = searchParams.get("sort_by") || "date_creation"
    const sortOrder = searchParams.get("sort_order") || "desc"
    const validSortFields = ["date_creation", "juld", "platform_number", "cycle_number", "latitude", "longitude"]
    const validSortOrders = ["asc", "desc"]

    const sortField = validSortFields.includes(sortBy) ? sortBy : "date_creation"
    const sortDirection = validSortOrders.includes(sortOrder) ? sortOrder : "desc"

    // Main query for profiles with pagination
    const profilesQuery = `
      SELECT
        p.profile_id,
        p.platform_number,
        p.cycle_number,
        p.latitude,
        p.longitude,
        p.juld,
        p.date_creation,
        p.data_centre as data_center,
        p.data_mode,
        p.platform_type,
        p.project_name,
        p.pi_name,
        p.profile_temp_qc,
        p.profile_psal_qc,
        p.profile_pres_qc,
        p.position_qc,
        p.juld_qc
      FROM \`argo-472010.argo_full.profiles\` p
      ${whereClause}
      ORDER BY p.${sortField} ${sortDirection.toUpperCase()}
      LIMIT ${limit}
      OFFSET ${offset}
    `

    // Count query for total results
    const countQuery = `
      SELECT COUNT(*) as total_count
      FROM \`argo-472010.argo_full.profiles\` p
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

    console.log('Executing enhanced profiles queries...')

    // Execute all queries in parallel
    const [profilesResult, countResult, measurementCountResult] = await Promise.all([
      bigQueryService.executeQuery(profilesQuery, params),
      bigQueryService.executeQuery(countQuery, params),
      bigQueryService.executeQuery(measurementCountQuery, params)
    ])

    const totalCount = countResult[0]?.total_count || 0
    const measurementCount = measurementCountResult[0]?.measurement_count || 0
    const totalPages = Math.ceil(totalCount / limit)

    console.log(`Enhanced profiles: ${profilesResult.length} profiles, total: ${totalCount}, measurements: ${measurementCount}`)

    // Add computed fields to profiles
    const enhancedProfiles = profilesResult.map((profile: any) => ({
      ...profile,
      // Add computed Julian day to readable date conversion
      juld_readable: profile.juld ? new Date('1950-01-01T00:00:00Z').getTime() + profile.juld * 24 * 60 * 60 * 1000 : null,
      // Position quality indicator
      position_quality: profile.position_qc === '1' ? 'good' : 'questionable',
      // Overall profile quality score
      quality_score: calculateQualityScore(profile.profile_temp_qc, profile.profile_psal_qc, profile.profile_pres_qc)
    }))

    return NextResponse.json({
      profiles: enhancedProfiles,
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
        totalMeasurements: measurementCount,
        qualityBreakdown: await getQualityBreakdown(whereClause, params)
      },
      filters: {
        applied: conditions.length,
        sortBy: sortField,
        sortOrder: sortDirection
      },
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error("Enhanced profiles API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch enhanced profiles",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Helper function to calculate quality score
function calculateQualityScore(tempQc: string, psalQc: string, presQc: string): number {
  const scores: { [key: string]: number } = {
    'A': 5, // Adjusted - highest quality
    '1': 4, // Good
    '2': 3, // Probably good
    'B': 2, // Real-time
    'C': 1, // Correctable
    'F': 0, // Failed
  }

  const tempScore = scores[tempQc] || 0
  const psalScore = scores[psalQc] || 0
  const presScore = scores[presQc] || 0

  return Math.round((tempScore + psalScore + presScore) / 3)
}

// Helper function to get quality breakdown
async function getQualityBreakdown(whereClause: string, params: any[]) {
  try {
    const qualityQuery = `
      SELECT
        data_mode,
        COUNT(*) as count,
        AVG(CASE
          WHEN profile_temp_qc = 'A' THEN 5
          WHEN profile_temp_qc = '1' THEN 4
          WHEN profile_temp_qc = '2' THEN 3
          ELSE 1
        END) as avg_temp_quality
      FROM \`argo-472010.argo_full.profiles\` p
      ${whereClause}
      GROUP BY data_mode
      ORDER BY count DESC
    `

    const result = await bigQueryService.executeQuery(qualityQuery, params)
    return result.reduce((acc: any, row: any) => {
      acc[row.data_mode] = {
        count: row.count,
        avgTempQuality: parseFloat(row.avg_temp_quality?.toFixed(2) || '0')
      }
      return acc
    }, {})
  } catch (error) {
    console.warn('Failed to get quality breakdown:', error)
    return {}
  }
}