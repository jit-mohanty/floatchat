export interface ApiResponse<T> {
  data: T
  error?: string
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}/api${endpoint}`, window.location.origin)

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })
      }

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error("API request failed:", error)
      return {
        data: null as T,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }
    }
  }

  // Convert enhanced filters to query parameters
  private buildQueryParams(filters?: any): Record<string, string | number | boolean> {
    if (!filters) return {}

    const params: Record<string, string | number | boolean> = {}

    // Date range
    if (filters.dateRange) {
      if (filters.dateRange.start) params.startDate = filters.dateRange.start
      if (filters.dateRange.end) params.endDate = filters.dateRange.end
    }

    // Geospatial bounds
    if (filters.geospatial?.boundingBox) {
      const { minLat, maxLat, minLon, maxLon } = filters.geospatial.boundingBox
      params.minLat = minLat
      params.maxLat = maxLat
      params.minLon = minLon
      params.maxLon = maxLon
    }

    // Circular radius
    if (filters.geospatial?.circularRadius) {
      const { centerLat, centerLon, radiusKm } = filters.geospatial.circularRadius
      params.centerLat = centerLat
      params.centerLon = centerLon
      params.radiusKm = radiusKm
    }

    // Measurement ranges
    if (filters.measurements) {
      if (filters.measurements.temperatureRange) {
        params.minTemp = filters.measurements.temperatureRange.min
        params.maxTemp = filters.measurements.temperatureRange.max
      }
      if (filters.measurements.salinityRange) {
        params.minSalinity = filters.measurements.salinityRange.min
        params.maxSalinity = filters.measurements.salinityRange.max
      }
    }

    // Depth range
    if (typeof filters.minDepth === 'number') params.minDepth = filters.minDepth
    if (typeof filters.maxDepth === 'number') params.maxDepth = filters.maxDepth

    // Platform filters
    if (filters.platform) {
      if (filters.platform.specificFloats?.length) {
        params.platformNumbers = filters.platform.specificFloats.join(',')
      }
      if (filters.platform.dataCenter) params.dataCenter = filters.platform.dataCenter
      if (filters.platform.projectName) params.projectName = filters.platform.projectName
      if (filters.platform.dataMode) params.dataMode = filters.platform.dataMode
    }

    // Quality control
    if (filters.qualityControl) {
      if (filters.qualityControl.goodOnly) params.goodOnly = true
      if (filters.qualityControl.includeQuestionable) params.includeQuestionable = true
    }

    return params
  }

  // Specific methods for ARGO data
  async getFloats(filters?: any) {
    const params = this.buildQueryParams(filters)
    return this.get("/floats", params)
  }

  async getFloatProfile(floatId: string) {
    return this.get(`/floats/${floatId}/profile`)
  }

  async getFloatTimeSeries(floatId: string, dateRange?: { start?: string; end?: string }) {
    return this.get(`/floats/${floatId}/timeseries`, dateRange)
  }

  async getFloatTrajectory(floatId: string, dateRange?: { start?: string; end?: string }) {
    return this.get(`/floats/${floatId}/trajectory`, dateRange)
  }

  async getQualityControlStats(filters?: any) {
    const params = this.buildQueryParams(filters)
    return this.get("/quality-control-stats", params)
  }
}

export const apiClient = new ApiClient()
