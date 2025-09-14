import { type NextRequest, NextResponse } from "next/server"
import { bigQueryService } from "@/lib/bigquery-client"

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching filter options from BigQuery...')

    // Query to get all available filter options
    const filterOptionsQuery = `
      WITH profile_stats AS (
        SELECT DISTINCT
          data_centre,
          data_mode,
          platform_type,
          project_name,
          profile_temp_qc,
          profile_psal_qc,
          profile_pres_qc
        FROM \`argo-472010.argo_full.profiles\`
        WHERE data_centre IS NOT NULL
          AND data_mode IS NOT NULL
          AND platform_type IS NOT NULL
          AND project_name IS NOT NULL
      )
      SELECT
        -- Data Centres
        (SELECT ARRAY_AGG(DISTINCT data_centre ORDER BY data_centre)
         FROM profile_stats WHERE data_centre IS NOT NULL) as data_centres,

        -- Data Modes
        (SELECT ARRAY_AGG(DISTINCT data_mode ORDER BY data_mode)
         FROM profile_stats WHERE data_mode IS NOT NULL) as data_modes,

        -- Platform Types
        (SELECT ARRAY_AGG(DISTINCT platform_type ORDER BY platform_type)
         FROM profile_stats WHERE platform_type IS NOT NULL) as platform_types,

        -- Projects (limit to top 20 most common)
        (SELECT ARRAY_AGG(project_name ORDER BY count DESC)
         FROM (
           SELECT project_name, COUNT(*) as count
           FROM profile_stats
           WHERE project_name IS NOT NULL
           GROUP BY project_name
           ORDER BY count DESC
           LIMIT 20
         )) as projects,

        -- Quality Control flags
        (SELECT ARRAY_AGG(DISTINCT qc_flag ORDER BY qc_flag)
         FROM (
           SELECT profile_temp_qc as qc_flag FROM profile_stats WHERE profile_temp_qc IS NOT NULL
           UNION DISTINCT
           SELECT profile_psal_qc as qc_flag FROM profile_stats WHERE profile_psal_qc IS NOT NULL
           UNION DISTINCT
           SELECT profile_pres_qc as qc_flag FROM profile_stats WHERE profile_pres_qc IS NOT NULL
         )) as quality_flags
    `

    console.log('Executing filter options query...')
    const result = await bigQueryService.executeQuery(filterOptionsQuery)

    if (result.length === 0) {
      throw new Error('No filter options found')
    }

    const options = result[0]

    // Transform quality flags to readable labels
    const qualityOptions = (options.quality_flags || []).map((flag: string) => ({
      value: flag,
      label: getQualityLabel(flag)
    }))

    // Add derived quality filter options
    const enhancedQualityOptions = [
      { value: 'all', label: 'All Quality' },
      { value: 'good', label: 'Good Quality Only (QC=A)' },
      { value: 'real_time', label: 'Real-time (QC=1-2)' },
      { value: 'adjusted', label: 'Delayed Mode (QC=A)' },
      ...qualityOptions.filter((opt: any) => opt.value && opt.value !== 'A' && !['1', '2', '3', '4'].includes(opt.value))
    ]

    const filterOptions = {
      dataCentres: (options.data_centres || []).map((centre: string) => ({
        value: centre,
        label: getDataCentreLabel(centre)
      })),

      dataModes: (options.data_modes || []).map((mode: string) => ({
        value: mode,
        label: getDataModeLabel(mode)
      })),

      platformTypes: (options.platform_types || []).sort(),

      projects: (options.projects || []).slice(0, 15), // Limit to top 15

      qualityOptions: enhancedQualityOptions
    }

    console.log(`Found filter options: ${filterOptions.dataCentres.length} centres, ${filterOptions.platformTypes.length} platforms, ${filterOptions.projects.length} projects`)

    return NextResponse.json({
      success: true,
      options: filterOptions,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error("Filter options API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch filter options",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// Helper functions for labels
function getDataCentreLabel(centre: string): string {
  const labels: { [key: string]: string } = {
    'AO': 'AO - Australia (CSIRO)',
    'BO': 'BO - France (Coriolis)',
    'CS': 'CS - Canada',
    'HZ': 'HZ - Japan (JMA)',
    'IF': 'IF - Germany (BSH)',
    'JA': 'JA - Japan (JAMSTEC)',
    'KM': 'KM - South Korea',
    'ME': 'ME - USA (AOML)',
    'NM': 'NM - USA (PMEL)',
    'PH': 'PH - Philippines',
    'VN': 'VN - India (INCOIS)'
  }
  return labels[centre] || `${centre} - Unknown`
}

function getDataModeLabel(mode: string): string {
  const labels: { [key: string]: string } = {
    'R': 'Real-time',
    'A': 'Adjusted (Delayed Mode)',
    'D': 'Delayed Mode'
  }
  return labels[mode] || mode
}

function getQualityLabel(qc: string): string {
  const labels: { [key: string]: string } = {
    '1': 'Good',
    '2': 'Probably Good',
    '3': 'Probably Bad',
    '4': 'Bad',
    '8': 'Estimated',
    '9': 'Missing',
    'A': 'Adjusted/Delayed Mode',
    'B': 'Real-time',
    'C': 'Real-time (Corrected)',
    'D': 'Delayed Mode',
    'F': 'Failed'
  }
  return labels[qc] || `QC ${qc}`
}