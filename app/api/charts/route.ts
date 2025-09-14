import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const chartType = searchParams.get("type")

    if (!chartType) {
      return NextResponse.json(
        { error: "Chart type is required. Use ?type=chart-name" },
        { status: 400 }
      )
    }

    console.log(`Charts API: Fetching data for ${chartType}`)

    let data: any = null
    let chartConfig: any = null

    switch (chartType) {
      case 'global-distribution':
        data = await getGlobalFloatDistribution()
        chartConfig = {
          title: "Global Float Distribution Map",
          description: "Distribution of ARGO floats worldwide",
          type: "map"
        }
        break

      case 'data-mode-pie':
        data = await getDataModeDistribution()
        chartConfig = {
          title: "Data Mode Distribution",
          description: "Real-time vs Adjusted mode floats",
          type: "pie"
        }
        break

      case 'temperature-trends':
        data = await getTemperatureTrendsByRegion()
        chartConfig = {
          title: "Temperature Trends by Region (Last 6 Months)",
          description: "Average surface temperature across regions",
          type: "line"
        }
        break

      case 'salinity-depth':
        data = await getSalinityDepthProfile()
        chartConfig = {
          title: "Salinity vs Depth Profile",
          description: "Average salinity changes with ocean depth",
          type: "line"
        }
        break

      case 'ts-scatter':
        data = await getTemperatureSalinityScatter()
        chartConfig = {
          title: "Temperature-Salinity (T-S) Diagram",
          description: "Water mass identification scatter plot",
          type: "scatter"
        }
        break

      case 'pressure-distribution':
        data = await getPressureDistribution()
        chartConfig = {
          title: "Measurement Distribution by Depth",
          description: "Number of measurements at different depths",
          type: "bar"
        }
        break

      case 'deployments-timeline':
        data = await getDeploymentsTimeline()
        chartConfig = {
          title: "Profile Deployments Over Time",
          description: "Profile and float deployments by year",
          type: "bar"
        }
        break

      case 'regional-distribution':
        data = await getRegionalFloatDistribution()
        chartConfig = {
          title: "Regional Float Distribution",
          description: "Float count by geographic regions",
          type: "bar"
        }
        break

      default:
        return NextResponse.json(
          { error: `Unknown chart type: ${chartType}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      chartType,
      config: chartConfig,
      data,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error(`Charts API error for type ${request.nextUrl.searchParams.get("type")}:`, error)
    return NextResponse.json(
      {
        error: "Failed to fetch chart data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Chart 1: Global Float Distribution Map
async function getGlobalFloatDistribution() {
  const query = `
    SELECT DISTINCT
      p.platform_number,
      p.latitude,
      p.longitude,
      p.data_mode as status,
      p.data_centre as data_center
    FROM \`argo-472010.argo_full.profiles\` p
    WHERE p.latitude IS NOT NULL
      AND p.longitude IS NOT NULL
      AND p.latitude BETWEEN -90 AND 90
      AND p.longitude BETWEEN -180 AND 180
    LIMIT 2000
  `

  const result = await bigQueryService.executeQuery(query)

  return {
    floats: result.map((row: any) => ({
      platform_number: row.platform_number,
      lat: row.latitude,
      lng: row.longitude,
      status: row.status === 'A' ? 'adjusted' : row.status === 'R' ? 'real-time' : 'other',
      data_center: row.data_center
    })),
    total: result.length
  }
}

// Chart 2: Data Mode Distribution (Pie Chart)
async function getDataModeDistribution() {
  const query = `
    SELECT
      data_mode as status,
      COUNT(DISTINCT platform_number) as count
    FROM \`argo-472010.argo_full.profiles\`
    WHERE data_mode IS NOT NULL
    GROUP BY data_mode
    ORDER BY count DESC
  `

  const result = await bigQueryService.executeQuery(query)

  return {
    distribution: result.map((row: any) => ({
      name: row.status === 'A' ? 'Adjusted/Delayed Mode' :
            row.status === 'R' ? 'Real-time' :
            row.status === 'D' ? 'Delayed Mode' : `Mode ${row.status}`,
      value: row.count,
      status: row.status
    })),
    total: result.reduce((sum: number, row: any) => sum + row.count, 0)
  }
}

// Chart 3: Temperature Trends by Region (Last 6 Months)
async function getTemperatureTrendsByRegion() {
  // Calculate Julian day for 6 months ago (ARGO reference: 1950-01-01)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const referenceDate = new Date('1950-01-01T00:00:00Z')
  const julianDayThreshold = Math.floor((sixMonthsAgo.getTime() - referenceDate.getTime()) / (24 * 60 * 60 * 1000))

  const query = `
    WITH recent_surface_temps AS (
      SELECT
        p.profile_id,
        p.latitude,
        p.juld,
        p.profile_temp_qc,
        m.temp_adjusted,
        CASE
          WHEN p.latitude > 66.5 THEN 'Arctic'
          WHEN p.latitude > 23.5 THEN 'Northern Hemisphere'
          WHEN p.latitude > -23.5 THEN 'Tropical'
          WHEN p.latitude > -66.5 THEN 'Southern Hemisphere'
          ELSE 'Antarctic'
        END as region,
        -- Convert Julian day back to date for grouping
        DATE(DATE_ADD('1950-01-01', INTERVAL CAST(p.juld) DAY)) as profile_date
      FROM \`argo-472010.argo_full.profiles\` p
      JOIN \`argo-472010.argo_full.measurements\` m ON p.profile_id = m.profile_id
      WHERE p.juld IS NOT NULL
        AND p.juld >= ${julianDayThreshold}  -- Last 6 months
        AND p.latitude IS NOT NULL
        AND p.profile_temp_qc = 'A'  -- Adjusted/good quality profiles only
        AND m.level_index <= 5  -- Surface measurements (top 5 levels)
        AND m.temp_adjusted IS NOT NULL
        AND m.temp_adjusted BETWEEN -2 AND 35  -- Reasonable ocean temperatures
        AND m.temp_qc = '1'  -- Good measurement quality
    )
    SELECT
      region,
      DATE_TRUNC(profile_date, MONTH) as month,
      AVG(temp_adjusted) as avg_temp,
      COUNT(*) as measurement_count,
      COUNT(DISTINCT profile_id) as profile_count
    FROM recent_surface_temps
    GROUP BY region, month
    HAVING measurement_count >= 20 AND profile_count >= 5  -- Filter sparse data
    ORDER BY month, region
  `

  const result = await bigQueryService.executeQuery(query)

  // Group by month for chart format
  const monthlyData: { [key: string]: any } = {}

  result.forEach((row: any) => {
    const monthStr = row.month.value || row.month
    if (!monthlyData[monthStr]) {
      monthlyData[monthStr] = {
        month: monthStr,
        month_display: new Date(monthStr).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short'
        })
      }
    }
    monthlyData[monthStr][row.region] = parseFloat(row.avg_temp.toFixed(2))
  })

  return {
    trends: Object.values(monthlyData),
    regions: [...new Set(result.map((row: any) => row.region))],
    metadata: {
      total_measurements: result.reduce((sum, row) => sum + row.measurement_count, 0),
      date_range: `Last 6 months (Julian day >= ${julianDayThreshold})`
    }
  }
}

// Chart 4: Salinity vs Depth Profile
async function getSalinityDepthProfile() {
  const query = `
    SELECT
      ROUND(pres_adjusted, -50) as depth_bin,
      AVG(psal_adjusted) as avg_salinity,
      COUNT(*) as measurement_count
    FROM \`argo-472010.argo_full.measurements\`
    WHERE pres_adjusted IS NOT NULL
      AND psal_adjusted IS NOT NULL
      AND pres_adjusted <= 2000  -- Focus on upper 2000m
      AND psal_qc = '1'  -- Good quality only
    GROUP BY depth_bin
    HAVING measurement_count >= 100  -- Filter sparse bins
    ORDER BY depth_bin
  `

  const result = await bigQueryService.executeQuery(query)

  return {
    profile: result.map((row: any) => ({
      depth: row.depth_bin,
      salinity: parseFloat(row.avg_salinity.toFixed(3)),
      count: row.measurement_count
    }))
  }
}

// Chart 5: Temperature-Salinity (T-S) Scatter Plot
async function getTemperatureSalinityScatter() {
  const query = `
    SELECT
      temp_adjusted as temperature,
      psal_adjusted as salinity
    FROM \`argo-472010.argo_full.measurements\`
    WHERE temp_adjusted IS NOT NULL
      AND psal_adjusted IS NOT NULL
      AND temp_qc = '1'
      AND psal_qc = '1'  -- Good quality only
      AND temp_adjusted BETWEEN -2 AND 35  -- Reasonable ocean temps
      AND psal_adjusted BETWEEN 30 AND 40   -- Reasonable ocean salinity
    LIMIT 5000
  `

  const result = await bigQueryService.executeQuery(query)

  return {
    points: result.map((row: any) => ({
      temperature: parseFloat(row.temperature.toFixed(2)),
      salinity: parseFloat(row.salinity.toFixed(3))
    }))
  }
}

// Chart 6: Pressure Distribution by Depth Bins
async function getPressureDistribution() {
  const query = `
    SELECT
      CASE
        WHEN pres_adjusted < 100 THEN '0-100m'
        WHEN pres_adjusted < 500 THEN '100-500m'
        WHEN pres_adjusted < 1000 THEN '500-1000m'
        WHEN pres_adjusted < 1500 THEN '1000-1500m'
        WHEN pres_adjusted < 2000 THEN '1500-2000m'
        ELSE '2000m+'
      END as depth_range,
      COUNT(*) as measurement_count,
      AVG(pres_adjusted) as avg_pressure
    FROM \`argo-472010.argo_full.measurements\`
    WHERE pres_adjusted IS NOT NULL
    GROUP BY depth_range
    ORDER BY MIN(pres_adjusted)
  `

  const result = await bigQueryService.executeQuery(query)

  return {
    distribution: result.map((row: any) => ({
      depth_range: row.depth_range,
      count: row.measurement_count,
      avg_pressure: parseFloat(row.avg_pressure.toFixed(1))
    }))
  }
}

// Chart 7: Profile Deployments Over Time
async function getDeploymentsTimeline() {
  const query = `
    SELECT
      DATE_TRUNC(DATE(date_creation), YEAR) as year,
      COUNT(DISTINCT profile_id) as profile_count,
      COUNT(DISTINCT platform_number) as float_count
    FROM \`argo-472010.argo_full.profiles\`
    WHERE date_creation IS NOT NULL
      AND DATE(date_creation) >= '2000-01-01'  -- Filter very old/invalid dates
      AND DATE(date_creation) <= CURRENT_DATE()
    GROUP BY year
    ORDER BY year
  `

  const result = await bigQueryService.executeQuery(query)

  return {
    timeline: result.map((row: any) => ({
      year: row.year.value || row.year,
      profiles: row.profile_count,
      floats: row.float_count
    }))
  }
}

// Chart 8: Regional Float Distribution
async function getRegionalFloatDistribution() {
  const query = `
    SELECT
      CASE
        WHEN p.latitude > 60 THEN 'Arctic'
        WHEN p.latitude > 30 THEN 'North Temperate'
        WHEN p.latitude > 0 THEN 'North Tropical'
        WHEN p.latitude > -30 THEN 'South Tropical'
        WHEN p.latitude > -60 THEN 'South Temperate'
        ELSE 'Antarctic'
      END as region,
      COUNT(DISTINCT platform_number) as float_count,
      COUNT(DISTINCT profile_id) as profile_count,
      AVG(latitude) as avg_latitude
    FROM \`argo-472010.argo_full.profiles\` p
    WHERE latitude IS NOT NULL
    GROUP BY region
    ORDER BY float_count DESC
  `

  const result = await bigQueryService.executeQuery(query)

  return {
    regions: result.map((row: any) => ({
      region: row.region,
      float_count: row.float_count,
      profile_count: row.profile_count,
      avg_latitude: parseFloat(row.avg_latitude.toFixed(2))
    }))
  }
}