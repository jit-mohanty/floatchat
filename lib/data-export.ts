// Data export utilities for ARGO profile data

interface ProfileData {
  profile_id: number
  platform_number: string
  cycle_number: number
  date_creation: string
  latitude: number
  longitude: number
  data_centre: string
  data_mode: string
  platform_type: string
  project_name: string
  pi_name: string
  profile_temp_qc: string
  profile_psal_qc: string
  profile_pres_qc: string
}

interface MeasurementData {
  measurement_id: number
  level_index: number
  pres_adjusted: number
  temp_adjusted: number
  psal_adjusted: number
  temp_qc: string
  psal_qc: string
  pres_qc: string
  temp_adjusted_error?: number
  psal_adjusted_error?: number
  pres_adjusted_error?: number
}

// Convert array of objects to CSV string
export function convertToCSV<T extends Record<string, any>>(data: T[], filename?: string): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')

  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      // Handle values that contain commas, quotes, or newlines
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(',')
  })

  return [csvHeaders, ...csvRows].join('\n')
}

// Download CSV file
export function downloadCSV<T extends Record<string, any>>(data: T[], filename: string): void {
  const csv = convertToCSV(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Download JSON file
export function downloadJSON<T>(data: T[], filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Export profile data with various formats
export function exportProfiles(profiles: ProfileData[], format: 'csv' | 'json' = 'csv'): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `argo_profiles_${timestamp}.${format}`

  if (format === 'csv') {
    downloadCSV(profiles, filename)
  } else {
    downloadJSON(profiles, filename)
  }
}

// Export measurement data with various formats
export function exportMeasurements(
  measurements: MeasurementData[],
  profileInfo: Pick<ProfileData, 'platform_number' | 'cycle_number'>,
  format: 'csv' | 'json' = 'csv'
): void {
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `argo_measurements_${profileInfo.platform_number}_${profileInfo.cycle_number}_${timestamp}.${format}`

  if (format === 'csv') {
    downloadCSV(measurements, filename)
  } else {
    downloadJSON(measurements, filename)
  }
}

// Generate API query URL for reproducible results
export function generateAPIQueryURL(filters: Record<string, any>, baseURL?: string): string {
  const base = baseURL || window.location.origin + '/api/profiles'
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') {
        params.append(key, JSON.stringify(value))
      } else {
        params.append(key, String(value))
      }
    }
  })

  return `${base}?${params.toString()}`
}

// Export filtered data with metadata
export function exportFilteredData(
  profiles: ProfileData[],
  filters: Record<string, any>,
  format: 'csv' | 'json' = 'csv'
): void {
  const timestamp = new Date().toISOString()
  const metadata = {
    export_timestamp: timestamp,
    total_records: profiles.length,
    applied_filters: filters,
    api_query_url: generateAPIQueryURL(filters),
    data_description: {
      profile_id: 'Unique profile identifier',
      platform_number: 'WMO float identifier',
      cycle_number: 'Measurement cycle number',
      date_creation: 'Profile creation date (YYYY-MM-DD)',
      latitude: 'Latitude in decimal degrees',
      longitude: 'Longitude in decimal degrees',
      data_centre: 'Data centre responsible for the float',
      data_mode: 'R=realtime, A=adjusted, D=delayed',
      platform_type: 'Float manufacturer and model',
      project_name: 'Associated research project',
      pi_name: 'Principal investigator',
      profile_temp_qc: 'Temperature quality control flag',
      profile_psal_qc: 'Salinity quality control flag',
      profile_pres_qc: 'Pressure quality control flag'
    },
    quality_control_flags: {
      '1': 'Good data',
      '2': 'Probably good data',
      '3': 'Probably bad data that are potentially correctable',
      '4': 'Bad data',
      '8': 'Estimated value',
      '9': 'Missing value'
    }
  }

  const exportData = {
    metadata,
    profiles
  }

  const filename = `argo_filtered_export_${timestamp.split('T')[0]}.${format}`

  if (format === 'csv') {
    // For CSV, export profiles data and metadata separately
    const metadataCSV = `# ARGO Data Export\n# Generated: ${timestamp}\n# Records: ${profiles.length}\n# Filters: ${JSON.stringify(filters)}\n# API URL: ${generateAPIQueryURL(filters)}\n\n`
    const profilesCSV = convertToCSV(profiles)
    const combinedCSV = metadataCSV + profilesCSV

    const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    downloadJSON(exportData, filename)
  }
}

// Get file size estimate
export function getExportSizeEstimate(recordCount: number, format: 'csv' | 'json' = 'csv'): string {
  // Rough estimates based on average record size
  const avgRecordSizeCSV = 150 // bytes per profile record in CSV
  const avgRecordSizeJSON = 250 // bytes per profile record in JSON

  const avgSize = format === 'csv' ? avgRecordSizeCSV : avgRecordSizeJSON
  const totalBytes = recordCount * avgSize

  if (totalBytes < 1024) {
    return `${totalBytes} B`
  } else if (totalBytes < 1024 * 1024) {
    return `${(totalBytes / 1024).toFixed(1)} KB`
  } else {
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
  }
}