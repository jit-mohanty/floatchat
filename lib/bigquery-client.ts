import { BigQuery, Job } from '@google-cloud/bigquery'

// BigQuery client configuration
const bigQueryConfig = {
  projectId: process.env.BIGQUERY_PROJECT_ID,
  location: process.env.BIGQUERY_LOCATION || 'US',
}

// Initialize BigQuery client
let bigquery: BigQuery | null = null

function getBigQueryClient(): BigQuery {
  if (!bigquery) {
    if (process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64) {
      // Use base64 encoded credentials
      const credentials = JSON.parse(
        Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS_BASE64, 'base64').toString()
      )
      bigquery = new BigQuery({
        ...bigQueryConfig,
        credentials,
      })
    } else {
      // Use Application Default Credentials (ADC) - automatically finds gcloud credentials
      console.log('Using Application Default Credentials for BigQuery')
      bigquery = new BigQuery(bigQueryConfig)
    }
  }
  return bigquery
}

// Dataset configuration
const DATASET_ID = process.env.BIGQUERY_DATASET || 'argo_data'

// Utility functions
export function julianDayToISODate(julianDay: number | null | undefined): string {
  // Handle null/undefined values
  if (julianDay === null || julianDay === undefined || isNaN(julianDay)) {
    return new Date().toISOString() // Return current date as fallback
  }

  // ARGO reference date: 1950-01-01
  const referenceDate = new Date('1950-01-01T00:00:00Z')
  const resultDate = new Date(referenceDate.getTime() + julianDay * 24 * 60 * 60 * 1000)

  // Validate the result
  if (isNaN(resultDate.getTime())) {
    return new Date().toISOString() // Return current date as fallback
  }

  return resultDate.toISOString()
}

export function isoDateToJulianDay(isoDate: string): number {
  // Convert ISO date to Julian day since 1950-01-01
  const targetDate = new Date(isoDate)
  const referenceDate = new Date('1950-01-01T00:00:00Z')
  const diffTime = targetDate.getTime() - referenceDate.getTime()
  return diffTime / (24 * 60 * 60 * 1000)
}

// Enhanced date utilities for filtering
export function dateStringToJulianDay(dateString: string): number {
  // Handle various date formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
  let normalizedDate: string

  if (dateString.includes('/')) {
    // Handle DD/MM/YYYY or MM/DD/YYYY format
    const parts = dateString.split('/')
    if (parts.length === 3) {
      // Assume DD/MM/YYYY format (European style)
      const [day, month, year] = parts
      normalizedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    } else {
      throw new Error(`Invalid date format: ${dateString}`)
    }
  } else {
    // Already in YYYY-MM-DD format
    normalizedDate = dateString
  }

  const targetDate = new Date(normalizedDate + 'T00:00:00Z')
  if (isNaN(targetDate.getTime())) {
    throw new Error(`Invalid date: ${dateString}`)
  }

  const referenceDate = new Date('1950-01-01T00:00:00Z')
  const diffTime = targetDate.getTime() - referenceDate.getTime()
  return Math.floor(diffTime / (24 * 60 * 60 * 1000))
}

export function julianDayToDateString(julianDay: number): string {
  // Convert Julian day to YYYY-MM-DD format
  const referenceDate = new Date('1950-01-01T00:00:00Z')
  const resultDate = new Date(referenceDate.getTime() + julianDay * 24 * 60 * 60 * 1000)

  if (isNaN(resultDate.getTime())) {
    throw new Error(`Invalid Julian day: ${julianDay}`)
  }

  return resultDate.toISOString().split('T')[0]
}

// Date range validation
export function validateDateRange(startDate?: string, endDate?: string): { isValid: boolean; error?: string } {
  if (!startDate && !endDate) {
    return { isValid: true }
  }

  try {
    if (startDate) {
      dateStringToJulianDay(startDate)
    }
    if (endDate) {
      dateStringToJulianDay(endDate)
    }

    // Check if start date is before end date
    if (startDate && endDate) {
      const startJulian = dateStringToJulianDay(startDate)
      const endJulian = dateStringToJulianDay(endDate)

      if (startJulian > endJulian) {
        return { isValid: false, error: 'Start date must be before end date' }
      }
    }

    return { isValid: true }
  } catch (error) {
    return { isValid: false, error: error instanceof Error ? error.message : 'Invalid date format' }
  }
}

export function mapQualityFlag(qcFlag: string): 'good' | 'questionable' | 'bad' | 'unknown' {
  switch (qcFlag) {
    case '1':
      return 'good'
    case '2':
      return 'questionable'
    case '3':
    case '4':
      return 'bad'
    default:
      return 'unknown'
  }
}

// Filter interfaces
export interface BigQueryFilters {
  dateRange?: {
    start: string
    end: string
  }
  geospatial?: {
    boundingBox?: {
      minLat: number
      maxLat: number
      minLon: number
      maxLon: number
    }
    circularRadius?: {
      centerLat: number
      centerLon: number
      radiusKm: number
    }
  }
  measurements?: {
    temperatureRange?: { min: number; max: number }
    salinityRange?: { min: number; max: number }
    depthRange?: { min: number; max: number }
  }
  platform?: {
    platformNumbers?: string[]
    dataCenter?: string
    projectName?: string
    dataMode?: string
  }
  qualityControl?: {
    goodOnly?: boolean
    includeQuestionable?: boolean
  }
}

// BigQuery service class
export class BigQueryService {
  private client: BigQuery
  private dataset: string

  constructor() {
    this.client = getBigQueryClient()
    this.dataset = DATASET_ID
  }

  // Execute query with error handling and timeout
  async executeQuery<T = any>(query: string, params?: any[]): Promise<T[]> {
    try {
      const options = {
        query,
        params,
        location: bigQueryConfig.location,
        maxResults: parseInt(process.env.BIGQUERY_MAX_RESULTS || '10000'),
        timeoutMs: parseInt(process.env.BIGQUERY_TIMEOUT_MS || '30000'),
        useLegacySql: false,
      }

      console.log('Executing BigQuery:', { query: query.substring(0, 200) + '...' })

      const [job] = await this.client.createQueryJob(options)
      const [rows] = await job.getQueryResults()

      console.log(`BigQuery returned ${rows.length} rows`)
      return rows as T[]
    } catch (error) {
      console.error('BigQuery execution error:', error)
      throw new Error(`BigQuery execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Build WHERE clauses from filters
  buildFilterConditions(filters: BigQueryFilters): { conditions: string[]; params: any[] } {
    const conditions: string[] = []
    const params: any[] = []

    // Date range filtering (temporarily disabled due to Julian day conversion issues)
    // TODO: Re-enable with proper date handling

    // Geospatial filtering
    if (filters.geospatial?.boundingBox) {
      const { minLat, maxLat, minLon, maxLon } = filters.geospatial.boundingBox
      conditions.push('p.latitude BETWEEN ? AND ?')
      conditions.push('p.longitude BETWEEN ? AND ?')
      params.push(minLat, maxLat, minLon, maxLon)
    }

    if (filters.geospatial?.circularRadius) {
      const { centerLat, centerLon, radiusKm } = filters.geospatial.circularRadius
      // Approximate distance using Haversine formula in BigQuery SQL
      // Convert degrees to radians manually: degrees * 3.14159 / 180
      conditions.push(`
        (6371 * ACOS(
          COS(? * 3.14159 / 180) * COS(p.latitude * 3.14159 / 180) *
          COS((p.longitude - ?) * 3.14159 / 180) +
          SIN(? * 3.14159 / 180) * SIN(p.latitude * 3.14159 / 180)
        )) <= ?
      `)
      params.push(centerLat, centerLon, centerLat, radiusKm)
    }

    // Measurement range filtering
    if (filters.measurements?.temperatureRange) {
      const { min, max } = filters.measurements.temperatureRange
      conditions.push('m.temp_adjusted BETWEEN ? AND ?')
      params.push(min, max)
    }

    if (filters.measurements?.salinityRange) {
      const { min, max } = filters.measurements.salinityRange
      conditions.push('m.psal_adjusted BETWEEN ? AND ?')
      params.push(min, max)
    }

    if (filters.measurements?.depthRange) {
      const { min, max } = filters.measurements.depthRange
      conditions.push('m.pres_adjusted BETWEEN ? AND ?')
      params.push(min, max)
    }

    // Platform filtering
    if (filters.platform?.platformNumbers?.length) {
      conditions.push(`p.platform_number IN (${filters.platform.platformNumbers.map(() => '?').join(',')})`)
      params.push(...filters.platform.platformNumbers)
    }

    if (filters.platform?.dataCenter) {
      conditions.push('p.data_center = ?')
      params.push(filters.platform.dataCenter)
    }

    if (filters.platform?.projectName) {
      conditions.push('p.project_name = ?')
      params.push(filters.platform.projectName)
    }

    if (filters.platform?.dataMode) {
      conditions.push('p.data_mode = ?')
      params.push(filters.platform.dataMode)
    }

    // Quality control filtering
    if (filters.qualityControl?.goodOnly) {
      conditions.push("(m.temp_qc = '1' OR m.temp_qc IS NULL)")
      conditions.push("(m.psal_qc = '1' OR m.psal_qc IS NULL)")
      conditions.push("(m.pres_qc = '1' OR m.pres_qc IS NULL)")
    } else if (filters.qualityControl?.includeQuestionable) {
      conditions.push("m.temp_qc IN ('1', '2') OR m.temp_qc IS NULL")
      conditions.push("m.psal_qc IN ('1', '2') OR m.psal_qc IS NULL")
      conditions.push("m.pres_qc IN ('1', '2') OR m.pres_qc IS NULL")
    }

    return { conditions, params }
  }

  // Get float list with latest surface measurements
  async getFloats(filters: BigQueryFilters = {}) {
    const { conditions, params } = this.buildFilterConditions(filters)
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT DISTINCT
        p.platform_number as id,
        p.latitude,
        p.longitude,
        CURRENT_TIMESTAMP() as lastUpdate,
        p.data_center as dataCentre,
        p.data_mode as dataMode,
        p.platform_type as platform,
        p.project_name,
        p.pi_name as principalInvestigator,
        -- Get surface measurements (level_index = 0 or minimum available)
        FIRST_VALUE(m.temp_adjusted) OVER (
          PARTITION BY p.profile_id ORDER BY m.level_index ASC
        ) as temperature,
        FIRST_VALUE(m.psal_adjusted) OVER (
          PARTITION BY p.profile_id ORDER BY m.level_index ASC
        ) as salinity,
        FIRST_VALUE(m.pres_adjusted) OVER (
          PARTITION BY p.profile_id ORDER BY m.level_index ASC
        ) as depth
      FROM \`${this.dataset}.profiles\` p
      LEFT JOIN \`${this.dataset}.measurements\` m
        ON p.profile_id = m.profile_id
      ${whereClause}
      LIMIT 1000
    `

    const rows = await this.executeQuery(query, params)

    return rows.map((row: any) => ({
      id: row.id,
      latitude: row.latitude,
      longitude: row.longitude,
      temperature: row.temperature,
      salinity: row.salinity,
      depth: row.depth,
      lastUpdate: new Date().toISOString(),
      dataCentre: row.dataCentre,
      dataMode: row.dataMode,
      platform: row.platform,
      projectName: row.project_name,
      principalInvestigator: row.principalInvestigator,
      profiles: 100, // Will be calculated separately if needed
    }))
  }

  // Get profile data for specific float
  async getFloatProfile(platformNumber: string) {
    const query = `
      SELECT
        m.pres_adjusted as depth,
        m.temp_adjusted as temperature,
        m.psal_adjusted as salinity,
        m.temp_qc,
        m.psal_qc,
        m.pres_qc,
        m.level_index
      FROM \`${this.dataset}.profiles\` p
      JOIN \`${this.dataset}.measurements\` m ON p.profile_id = m.profile_id
      WHERE p.platform_number = ?
        AND m.pres_adjusted IS NOT NULL
        AND m.temp_adjusted IS NOT NULL
        AND m.psal_adjusted IS NOT NULL
      ORDER BY m.level_index ASC
      LIMIT 2000
    `

    const rows = await this.executeQuery(query, [platformNumber])

    return {
      depth: rows.map(r => r.depth),
      temperature: rows.map(r => r.temperature),
      salinity: rows.map(r => r.salinity),
      qualityFlags: rows.map(r => ({
        temperature: mapQualityFlag(r.temp_qc),
        salinity: mapQualityFlag(r.psal_qc),
        pressure: mapQualityFlag(r.pres_qc),
      })),
    }
  }

  // Get time series data for specific float
  async getFloatTimeSeries(platformNumber: string, dateRange?: { start?: string; end?: string }) {
    const params = [platformNumber]

    const query = `
      SELECT
        CURRENT_TIMESTAMP() as date,
        p.cycle_number,
        AVG(CASE WHEN m.level_index < 10 THEN m.temp_adjusted END) as temperature,
        AVG(CASE WHEN m.level_index < 10 THEN m.psal_adjusted END) as salinity
      FROM \`${this.dataset}.profiles\` p
      JOIN \`${this.dataset}.measurements\` m ON p.profile_id = m.profile_id
      WHERE p.platform_number = ?
      GROUP BY p.cycle_number, p.profile_id
      ORDER BY p.cycle_number ASC
      LIMIT 500
    `

    const rows = await this.executeQuery(query, params)

    return rows.map((row: any) => ({
      date: new Date().toISOString(),
      cycleNumber: row.cycle_number,
      temperature: row.temperature,
      salinity: row.salinity,
    }))
  }

  // Get trajectory data for specific float
  async getFloatTrajectory(platformNumber: string, dateRange?: { start?: string; end?: string }) {
    const params = [platformNumber]

    const query = `
      SELECT
        CURRENT_TIMESTAMP() as date,
        p.latitude,
        p.longitude,
        p.cycle_number as cycle,
        AVG(CASE WHEN m.level_index < 5 THEN m.temp_adjusted END) as temperature
      FROM \`${this.dataset}.profiles\` p
      LEFT JOIN \`${this.dataset}.measurements\` m ON p.profile_id = m.profile_id
      WHERE p.platform_number = ?
      GROUP BY p.latitude, p.longitude, p.cycle_number, p.profile_id
      ORDER BY p.cycle_number ASC
      LIMIT 200
    `

    const rows = await this.executeQuery(query, params)

    return rows.map((row: any) => ({
      date: new Date().toISOString().split('T')[0], // Date only
      timestamp: new Date().getTime(),
      latitude: row.latitude,
      longitude: row.longitude,
      cycle: row.cycle,
      temperature: row.temperature,
    }))
  }

  // Get quality control statistics
  async getQualityControlStats(filters: BigQueryFilters = {}) {
    const query = `
      WITH qc_data AS (
        SELECT
          'temperature' as parameter_type,
          m.temp_qc as qc_flag,
          COUNT(*) as count
        FROM \`${this.dataset}.measurements\` m
        WHERE m.temp_qc IS NOT NULL
        GROUP BY m.temp_qc

        UNION ALL

        SELECT
          'salinity' as parameter_type,
          m.psal_qc as qc_flag,
          COUNT(*) as count
        FROM \`${this.dataset}.measurements\` m
        WHERE m.psal_qc IS NOT NULL
        GROUP BY m.psal_qc

        UNION ALL

        SELECT
          'pressure' as parameter_type,
          m.pres_qc as qc_flag,
          COUNT(*) as count
        FROM \`${this.dataset}.measurements\` m
        WHERE m.pres_qc IS NOT NULL
        GROUP BY m.pres_qc
      )
      SELECT
        parameter_type,
        qc_flag,
        count,
        CASE
          WHEN qc_flag = '1' THEN 'good'
          WHEN qc_flag = '2' THEN 'questionable'
          WHEN qc_flag IN ('3', '4') THEN 'bad'
          ELSE 'unknown'
        END as quality_level
      FROM qc_data
      ORDER BY parameter_type, qc_flag
    `

    const rows = await this.executeQuery(query)

    // Group results by parameter type
    const stats = rows.reduce((acc: any, row: any) => {
      if (!acc[row.parameter_type]) {
        acc[row.parameter_type] = {}
      }
      acc[row.parameter_type][row.quality_level] = row.count
      return acc
    }, {})

    return stats
  }

  // Get basic statistics for dashboard
  async getStatistics(filters: BigQueryFilters = {}) {
    const { conditions, params } = this.buildFilterConditions(filters)
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT
        COUNT(DISTINCT p.platform_number) as total_floats,
        COUNT(DISTINCT p.profile_id) as total_profiles,
        AVG(m.temp_adjusted) as avg_temperature,
        AVG(m.psal_adjusted) as avg_salinity,
        COUNT(DISTINCT p.data_center) as data_centers,
        COUNT(DISTINCT p.platform_type) as platform_types
      FROM \`${this.dataset}.profiles\` p
      LEFT JOIN \`${this.dataset}.measurements\` m ON p.profile_id = m.profile_id
      ${whereClause}
    `

    const [row] = await this.executeQuery(query, params)

    return {
      total: row.total_floats || 0,
      profiles: row.total_profiles || 0,
      averageTemperature: row.avg_temperature ? parseFloat(row.avg_temperature.toFixed(1)) : null,
      averageSalinity: row.avg_salinity ? parseFloat(row.avg_salinity.toFixed(1)) : null,
      dataCenters: row.data_centers || 0,
      platformTypes: row.platform_types || 0,
    }
  }

  // Get nearest floats to a location
  async getNearestFloats(
    centerLat: number,
    centerLon: number,
    maxDistanceKm: number,
    limit: number = 10
  ) {
    const query = `
      WITH recent_positions AS (
        SELECT DISTINCT
          platform_number,
          latitude,
          longitude,
          MAX(cycle_number) as latest_cycle,
          MAX(cycle_number) as last_seen
        FROM \`${this.dataset}.profiles\`
        GROUP BY platform_number, latitude, longitude
      )
      SELECT
        platform_number as id,
        latitude,
        longitude,
        latest_cycle as cycle,
        last_seen,
        (6371 * ACOS(
          COS(${centerLat} * 3.14159 / 180) * COS(latitude * 3.14159 / 180) *
          COS((longitude - ${centerLon}) * 3.14159 / 180) +
          SIN(${centerLat} * 3.14159 / 180) * SIN(latitude * 3.14159 / 180)
        )) AS distance_km
      FROM recent_positions
      WHERE (6371 * ACOS(
        COS(${centerLat} * 3.14159 / 180) * COS(latitude * 3.14159 / 180) *
        COS((longitude - ${centerLon}) * 3.14159 / 180) +
        SIN(${centerLat} * 3.14159 / 180) * SIN(latitude * 3.14159 / 180)
      )) <= ${maxDistanceKm}
      ORDER BY distance_km ASC
      LIMIT ${limit}
    `

    const rows = await this.executeQuery(query)
    return rows.map((row: any) => ({
      id: row.id,
      latitude: row.latitude,
      longitude: row.longitude,
      cycle: row.cycle,
      lastSeen: row.last_seen || 0,
      distanceKm: parseFloat(row.distance_km.toFixed(2))
    }))
  }

  // Get regional statistics for comparison
  async getRegionalStatistics(
    bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number },
    dateRange?: { start?: string; end?: string },
    depthRange?: { min: number; max: number }
  ) {
    const conditions = []
    conditions.push(`p.latitude BETWEEN ${bounds.minLat} AND ${bounds.maxLat}`)
    conditions.push(`p.longitude BETWEEN ${bounds.minLon} AND ${bounds.maxLon}`)

    if (depthRange) {
      conditions.push(`m.pres_adjusted BETWEEN ${depthRange.min} AND ${depthRange.max}`)
    }

    const whereClause = conditions.join(' AND ')

    const query = `
      SELECT
        COUNT(DISTINCT p.platform_number) as floatCount,
        COUNT(DISTINCT p.profile_id) as profileCount,
        AVG(m.temp_adjusted) as avgTemperature,
        MIN(m.temp_adjusted) as minTemperature,
        MAX(m.temp_adjusted) as maxTemperature,
        STDDEV(m.temp_adjusted) as stdDevTemperature,
        AVG(m.psal_adjusted) as avgSalinity,
        MIN(m.psal_adjusted) as minSalinity,
        MAX(m.psal_adjusted) as maxSalinity,
        STDDEV(m.psal_adjusted) as stdDevSalinity,
        COUNT(*) as measurementCount
      FROM \`${this.dataset}.profiles\` p
      JOIN \`${this.dataset}.measurements\` m ON p.profile_id = m.profile_id
      WHERE ${whereClause}
    `

    const [result] = await this.executeQuery(query)

    return {
      floatCount: result?.floatCount || 0,
      profileCount: result?.profileCount || 0,
      measurementCount: result?.measurementCount || 0,
      temperature: {
        avg: result?.avgTemperature?.toFixed(2) || null,
        min: result?.minTemperature?.toFixed(2) || null,
        max: result?.maxTemperature?.toFixed(2) || null,
        stdDev: result?.stdDevTemperature?.toFixed(2) || null
      },
      salinity: {
        avg: result?.avgSalinity?.toFixed(3) || null,
        min: result?.minSalinity?.toFixed(3) || null,
        max: result?.maxSalinity?.toFixed(3) || null,
        stdDev: result?.stdDevSalinity?.toFixed(3) || null
      }
    }
  }
}

// Export singleton instance
export const bigQueryService = new BigQueryService()