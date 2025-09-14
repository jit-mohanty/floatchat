// Mock ARGO float data for development
export interface ArgoFloat {
  id: string
  latitude: number
  longitude: number
  lastUpdate: string
  temperature: number | null
  salinity: number | null
  depth: number | null
  platform?: string
  dataCentre?: string
  dataMode?: string
  projectName?: string
  principalInvestigator?: string
  profiles?: number
}

export interface ProfileData {
  depth: number[]
  temperature: number[]
  salinity: number[]
  qualityFlags?: {
    temperature: 'good' | 'questionable' | 'bad' | 'unknown'
    salinity: 'good' | 'questionable' | 'bad' | 'unknown'
    pressure: 'good' | 'questionable' | 'bad' | 'unknown'
  }[]
}

export interface TimeSeriesData {
  date: string
  temperature: number | null
  salinity: number | null
  cycleNumber?: number
}

export const mockFloats: ArgoFloat[] = [
  {
    id: "INCOIS_2901001",
    latitude: -10.5,
    longitude: 67.2,
    lastUpdate: "2025-01-13T10:30:00Z",
    status: "active",
    temperature: 28.5,
    salinity: 35.1,
    pressure: 2000.5,
    depth: 2000,
    oxygen: 185.2,
    pH: 8.1,
    platform: "APEX",
    institution: "INCOIS",
    wmoId: "2901001",
    cycleNumber: 245,
    profileType: "bgc",
  },
  {
    id: "INCOIS_2901002",
    latitude: -15.8,
    longitude: 72.4,
    lastUpdate: "2025-01-13T09:15:00Z",
    status: "active",
    temperature: 26.8,
    salinity: 35.3,
    pressure: 1800.2,
    depth: 1800,
    oxygen: 178.5,
    platform: "NOVA",
    institution: "INCOIS",
    wmoId: "2901002",
    cycleNumber: 198,
    profileType: "core",
  },
  {
    id: "INCOIS_2901003",
    latitude: -5.2,
    longitude: 85.1,
    lastUpdate: "2025-01-12T14:20:00Z",
    status: "active",
    temperature: 29.1,
    salinity: 34.8,
    pressure: 1500.8,
    depth: 1500,
    oxygen: 195.8,
    pH: 8.2,
    nitrate: 12.5,
    chlorophyll: 0.8,
    platform: "APEX",
    institution: "INCOIS",
    wmoId: "2901003",
    cycleNumber: 156,
    profileType: "bgc",
  },
  {
    id: "INCOIS_2901004",
    latitude: -20.3,
    longitude: 57.8,
    lastUpdate: "2025-01-13T11:45:00Z",
    status: "active",
    temperature: 24.3,
    salinity: 35.4,
    pressure: 2000.1,
    depth: 2000,
    oxygen: 172.3,
    platform: "ARVOR",
    institution: "INCOIS",
    wmoId: "2901004",
    cycleNumber: 289,
    profileType: "core",
  },
  {
    id: "INCOIS_2901005",
    latitude: -8.7,
    longitude: 93.5,
    lastUpdate: "2025-01-13T08:30:00Z",
    status: "active",
    temperature: 28.9,
    salinity: 34.6,
    pressure: 1600.4,
    depth: 1600,
    oxygen: 188.7,
    pH: 8.0,
    nitrate: 15.2,
    chlorophyll: 1.2,
    platform: "APEX",
    institution: "INCOIS",
    wmoId: "2901005",
    cycleNumber: 134,
    profileType: "bgc",
  },
  {
    id: "INCOIS_2901006",
    latitude: -25.1,
    longitude: 45.2,
    lastUpdate: "2025-01-11T16:20:00Z",
    status: "inactive",
    temperature: 22.1,
    salinity: 35.6,
    pressure: 1200.0,
    depth: 1200,
    oxygen: 165.4,
    platform: "NOVA",
    institution: "INCOIS",
    wmoId: "2901006",
    cycleNumber: 98,
    profileType: "core",
  },
  {
    id: "INCOIS_2901007",
    latitude: -12.4,
    longitude: 78.9,
    lastUpdate: "2025-01-13T12:15:00Z",
    status: "active",
    temperature: 27.5,
    salinity: 35.0,
    pressure: 1900.7,
    depth: 1900,
    oxygen: 180.1,
    pH: 8.1,
    platform: "ARVOR",
    institution: "INCOIS",
    wmoId: "2901007",
    cycleNumber: 267,
    profileType: "bgc",
  },
  {
    id: "INCOIS_2901008",
    latitude: -18.6,
    longitude: 88.3,
    lastUpdate: "2025-01-13T07:45:00Z",
    status: "active",
    temperature: 25.8,
    salinity: 34.9,
    pressure: 1700.3,
    depth: 1700,
    oxygen: 175.9,
    platform: "APEX",
    institution: "INCOIS",
    wmoId: "2901008",
    cycleNumber: 203,
    profileType: "core",
  },
  {
    id: "INCOIS_2901009",
    latitude: -3.1,
    longitude: 60.7,
    lastUpdate: "2025-01-13T13:30:00Z",
    status: "active",
    temperature: 29.8,
    salinity: 34.7,
    pressure: 1400.6,
    depth: 1400,
    oxygen: 198.3,
    pH: 8.3,
    nitrate: 8.9,
    chlorophyll: 1.5,
    platform: "NOVA",
    institution: "INCOIS",
    wmoId: "2901009",
    cycleNumber: 112,
    profileType: "bgc",
  },
  {
    id: "INCOIS_2901010",
    latitude: -30.2,
    longitude: 52.4,
    lastUpdate: "2025-01-13T06:20:00Z",
    status: "active",
    temperature: 20.5,
    salinity: 35.8,
    pressure: 2000.9,
    depth: 2000,
    oxygen: 158.7,
    platform: "ARVOR",
    institution: "INCOIS",
    wmoId: "2901010",
    cycleNumber: 321,
    profileType: "core",
  },
]

export const mockProfileData: ProfileData = {
  depth: [0, 50, 100, 200, 500, 1000, 1500, 2000],
  temperature: [28.5, 26.1, 22.3, 18.8, 12.2, 8.5, 5.1, 3.2],
  salinity: [34.8, 35.0, 35.2, 35.1, 34.8, 34.5, 34.3, 34.1],
  pressure: [0, 50.2, 100.5, 200.8, 501.2, 1001.8, 1502.1, 2001.5],
  oxygen: [220, 210, 195, 180, 150, 120, 90, 70],
  pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5],
  nitrate: [2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3],
  chlorophyll: [1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01],
}

export const mockTimeSeriesData: TimeSeriesData[] = [
  { date: "2024-07-01", temperature: 26.2, salinity: 35.1, pressure: 1900 },
  { date: "2024-08-01", temperature: 27.5, salinity: 35.0, pressure: 1800 },
  { date: "2024-09-01", temperature: 28.8, salinity: 34.9, pressure: 1700 },
  { date: "2024-10-01", temperature: 29.1, salinity: 34.8, pressure: 1600 },
  { date: "2024-11-01", temperature: 28.3, salinity: 34.9, pressure: 1500 },
  { date: "2024-12-01", temperature: 27.8, salinity: 35.0, pressure: 1400 },
  { date: "2025-01-01", temperature: 28.2, salinity: 35.1, pressure: 1300 },
]

export const mockFloatProfiles: Record<string, ProfileData> = {
  INCOIS_2901001: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 1750, 2000],
    temperature: [
      28.5, 28.2, 27.8, 27.2, 26.1, 24.2, 22.3, 20.1, 18.2, 16.8, 14.9, 13.8, 12.2, 10.8, 9.5, 8.1, 6.8, 5.2, 4.1, 3.5,
      3.2,
    ],
    salinity: [
      34.8, 34.9, 35.0, 35.1, 35.0, 35.1, 35.2, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5, 34.4, 34.3, 34.2, 34.1, 34.0,
      33.9, 33.8,
    ],
    pressure: [
      0, 50.2, 100.5, 200.8, 501.2, 1001.8, 1502.1, 2001.5, 2501.8, 3002.1, 3502.4, 4002.7, 4503.0, 5003.3, 5503.6,
      6003.9, 6504.2, 7004.5, 7504.8, 8005.1, 8505.4,
    ],
    oxygen: [220, 218, 215, 212, 210, 205, 195, 188, 182, 180, 175, 165, 150, 140, 130, 125, 120, 105, 95, 80, 70],
    pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2],
    nitrate: [
      2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3, 45.9, 49.5, 53.1, 56.7, 60.3, 63.9, 67.5, 71.1, 74.7, 78.3, 81.9,
    ],
    chlorophyll: [
      1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0003, 0.0002, 0.0001, 0.00005,
      0.00003, 0.00002,
    ],
  },
  INCOIS_2901002: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 1750, 1800],
    temperature: [
      26.8, 26.5, 26.2, 25.8, 25.1, 23.5, 21.8, 19.9, 18.2, 16.5, 14.8, 13.9, 12.5, 11.2, 9.9, 8.6, 7.1, 5.8, 4.5, 3.8,
      3.6,
    ],
    salinity: [
      35.3, 35.3, 35.2, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5, 34.4, 34.3, 34.2, 34.1, 34.0, 33.9, 33.8, 33.7, 33.6,
      33.5, 33.5,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8, 866.4, 912.0,
    ],
    oxygen: [215, 213, 210, 208, 205, 200, 192, 185, 178, 172, 165, 158, 145, 135, 125, 115, 105, 95, 85],
  },
  INCOIS_2901003: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500],
    temperature: [
      29.1, 28.8, 28.5, 28.0, 27.2, 25.5, 23.1, 21.3, 19.6, 17.8, 16.9, 15.8, 14.2, 12.8, 11.5, 10.1, 8.8, 7.2, 5.9,
    ],
    salinity: [
      34.8, 34.7, 34.6, 34.5, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5, 34.4,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8,
    ],
    oxygen: [225, 223, 220, 218, 215, 210, 205, 198, 190, 185, 178, 170, 160, 148, 138, 128, 118, 108, 98],
    pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4],
    nitrate: [
      2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3, 45.9, 49.5, 53.1, 56.7, 60.3, 63.9, 67.5, 71.1, 74.7, 78.3, 81.9,
    ],
    chlorophyll: [
      1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0003, 0.0002, 0.0001, 0.00005,
      0.00003, 0.00002,
    ],
  },
  INCOIS_2901004: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 1750, 2000],
    temperature: [
      24.3, 24.0, 23.8, 23.3, 22.5, 21.8, 20.3, 18.5, 16.8, 15.1, 14.2, 13.5, 12.1, 10.8, 9.4, 8.0, 6.5, 5.1, 4.0, 3.4,
      3.2,
    ],
    salinity: [
      35.4, 35.5, 35.6, 35.7, 35.6, 35.5, 35.4, 35.3, 35.2, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5, 34.4, 34.3, 34.2,
      34.1, 34.0,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8, 866.4, 912.0,
    ],
    oxygen: [218, 216, 214, 212, 208, 203, 198, 192, 186, 180, 174, 168, 155, 142, 130, 120, 110, 98, 88, 78, 75],
  },
  INCOIS_2901005: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 1600],
    temperature: [
      28.9, 28.6, 28.3, 27.9, 27.1, 25.8, 24.1, 22.3, 20.6, 18.8, 17.2, 15.9, 14.5, 13.1, 11.8, 10.4, 8.9, 7.5, 6.1,
      5.8,
    ],
    salinity: [
      34.6, 34.5, 34.4, 34.3, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5, 34.4,
      34.3,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8, 866.4, 912.0,
    ],
    oxygen: [222, 220, 218, 216, 213, 208, 203, 196, 189, 182, 175, 168, 158, 148, 138, 128, 118, 108, 98, 95],
    pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4, 6.3],
    nitrate: [
      2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3, 45.9, 49.5, 53.1, 56.7, 60.3, 63.9, 67.5, 71.1, 74.7, 78.3, 81.9,
    ],
    chlorophyll: [
      1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0003, 0.0002, 0.0001, 0.00005,
      0.00003, 0.00002,
    ],
  },
  INCOIS_2901006: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1200],
    temperature: [
      22.1, 21.8, 21.5, 21.0, 20.2, 19.5, 18.8, 17.9, 16.2, 14.5, 13.8, 12.9, 11.5, 10.2, 8.9, 7.6, 6.1, 4.8,
    ],
    salinity: [
      35.6, 35.7, 35.8, 35.9, 35.8, 35.7, 35.6, 35.5, 35.4, 35.3, 35.2, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8, 866.4, 912.0,
    ],
    oxygen: [215, 213, 210, 208, 205, 200, 192, 185, 178, 172, 165, 158, 145, 135, 125, 115, 105, 95],
    pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4],
    nitrate: [
      2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3, 45.9, 49.5, 53.1, 56.7, 60.3, 63.9, 67.5, 71.1, 74.7, 78.3, 81.9,
    ],
    chlorophyll: [
      1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0003, 0.0002, 0.0001, 0.00005,
      0.00003, 0.00002,
    ],
  },
  INCOIS_2901007: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 1750, 1900],
    temperature: [
      27.5, 27.2, 26.8, 26.3, 25.5, 24.2, 22.8, 21.1, 19.4, 17.6, 16.1, 14.8, 13.4, 12.0, 10.7, 9.3, 7.9, 6.5, 5.2, 4.1,
      3.8,
    ],
    salinity: [
      35.0, 35.1, 35.2, 35.3, 35.2, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5, 34.4, 34.3, 34.2, 34.1, 34.0, 33.9, 33.8,
      33.7, 33.6,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8, 866.4, 912.0,
    ],
    oxygen: [220, 218, 215, 212, 208, 203, 198, 191, 184, 177, 170, 163, 153, 143, 133, 123, 113, 103, 93, 83, 80],
    pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2],
    nitrate: [
      2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3, 45.9, 49.5, 53.1, 56.7, 60.3, 63.9, 67.5, 71.1, 74.7, 78.3, 81.9,
    ],
    chlorophyll: [
      1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0003, 0.0002, 0.0001, 0.00005,
      0.00003, 0.00002,
    ],
  },
  INCOIS_2901008: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 1700],
    temperature: [
      25.8, 25.5, 25.2, 24.8, 24.1, 23.2, 21.9, 20.3, 18.7, 17.0, 15.6, 14.3, 12.9, 11.5, 10.2, 8.8, 7.4, 6.0, 4.8, 4.2,
    ],
    salinity: [
      34.9, 35.0, 35.1, 35.2, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5, 34.4, 34.3, 34.2, 34.1, 34.0, 33.9, 33.8, 33.7,
      33.6,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8, 866.4, 912.0,
    ],
    oxygen: [218, 216, 213, 210, 206, 201, 196, 189, 182, 175, 168, 161, 151, 141, 131, 121, 111, 101, 91, 85],
    pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2],
    nitrate: [
      2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3, 45.9, 49.5, 53.1, 56.7, 60.3, 63.9, 67.5, 71.1, 74.7, 78.3, 81.9,
    ],
    chlorophyll: [
      1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0003, 0.0002, 0.0001, 0.00005,
      0.00003, 0.00002,
    ],
  },
  INCOIS_2901009: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1400],
    temperature: [
      29.8, 29.5, 29.2, 28.8, 28.0, 26.5, 24.7, 22.8, 21.0, 19.1, 17.5, 16.2, 14.8, 13.4, 12.1, 10.7, 9.2, 7.8, 7.0,
    ],
    salinity: [
      34.7, 34.6, 34.5, 34.4, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 34.9, 34.8, 34.7, 34.6, 34.5, 34.4, 34.3,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8, 866.4, 912.0,
    ],
    oxygen: [225, 223, 220, 217, 213, 208, 203, 196, 189, 182, 175, 168, 158, 148, 138, 128, 118, 108, 102],
    pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4],
    nitrate: [
      2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3, 45.9, 49.5, 53.1, 56.7, 60.3, 63.9, 67.5, 71.1, 74.7, 78.3, 81.9,
    ],
    chlorophyll: [
      1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0003, 0.0002, 0.0001, 0.00005,
      0.00003, 0.00002,
    ],
  },
  INCOIS_2901010: {
    depth: [0, 10, 20, 30, 50, 75, 100, 125, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 1750, 2000],
    temperature: [
      20.5, 20.2, 19.8, 19.3, 18.5, 17.8, 16.3, 14.5, 12.8, 11.1, 10.2, 9.5, 8.1, 6.8, 5.4, 4.0, 3.5, 3.1, 2.8, 2.4,
      2.2,
    ],
    salinity: [
      35.8, 35.9, 36.0, 36.1, 36.0, 35.9, 35.8, 35.7, 35.6, 35.5, 35.4, 35.3, 35.2, 35.1, 35.0, 34.9, 34.8, 34.7, 34.6,
      34.5, 34.4,
    ],
    pressure: [
      0, 45.6, 91.2, 136.8, 182.4, 228.0, 273.6, 319.2, 364.8, 410.4, 456.0, 501.6, 547.2, 592.8, 638.4, 684.0, 729.6,
      775.2, 820.8, 866.4, 912.0,
    ],
    oxygen: [218, 216, 214, 212, 208, 203, 198, 192, 186, 180, 174, 168, 155, 142, 130, 120, 110, 98, 88, 78, 75],
    pH: [8.2, 8.1, 8.0, 7.9, 7.8, 7.7, 7.6, 7.5, 7.4, 7.3, 7.2, 7.1, 7.0, 6.9, 6.8, 6.7, 6.6, 6.5, 6.4, 6.3, 6.2],
    nitrate: [
      2.1, 5.8, 12.5, 18.9, 25.4, 32.1, 38.7, 42.3, 45.9, 49.5, 53.1, 56.7, 60.3, 63.9, 67.5, 71.1, 74.7, 78.3, 81.9,
    ],
    chlorophyll: [
      1.2, 0.8, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01, 0.005, 0.003, 0.002, 0.001, 0.0005, 0.0003, 0.0002, 0.0001, 0.00005,
      0.00003, 0.00002,
    ],
  },
}

export const mockTimeSeriesDataByFloat: Record<string, TimeSeriesData[]> = {
  INCOIS_2901001: [
    {
      date: "2024-07-01",
      temperature: 27.2,
      salinity: 34.9,
      pressure: 1850,
      oxygen: 185,
      pH: 8.0,
      nitrate: 12.0,
      chlorophyll: 0.7,
    },
    {
      date: "2024-08-01",
      temperature: 28.5,
      salinity: 34.8,
      pressure: 1750,
      oxygen: 190,
      pH: 8.1,
      nitrate: 12.5,
      chlorophyll: 0.8,
    },
    {
      date: "2024-09-01",
      temperature: 29.8,
      salinity: 34.7,
      pressure: 1650,
      oxygen: 195,
      pH: 8.2,
      nitrate: 13.0,
      chlorophyll: 0.9,
    },
    {
      date: "2024-10-01",
      temperature: 29.1,
      salinity: 34.8,
      pressure: 1550,
      oxygen: 180,
      pH: 8.3,
      nitrate: 13.5,
      chlorophyll: 1.0,
    },
    {
      date: "2024-11-01",
      temperature: 28.3,
      salinity: 34.9,
      pressure: 1450,
      oxygen: 175,
      pH: 8.4,
      nitrate: 14.0,
      chlorophyll: 1.1,
    },
    {
      date: "2024-12-01",
      temperature: 27.8,
      salinity: 35.0,
      pressure: 1350,
      oxygen: 170,
      pH: 8.5,
      nitrate: 14.5,
      chlorophyll: 1.2,
    },
    {
      date: "2025-01-01",
      temperature: 28.2,
      salinity: 35.1,
      pressure: 1250,
      oxygen: 165,
      pH: 8.6,
      nitrate: 15.0,
      chlorophyll: 1.3,
    },
  ],
  INCOIS_2901002: [
    { date: "2024-07-01", temperature: 25.8, salinity: 35.4, pressure: 1800, oxygen: 180 },
    { date: "2024-08-01", temperature: 26.9, salinity: 35.3, pressure: 1700, oxygen: 185 },
    { date: "2024-09-01", temperature: 28.2, salinity: 35.2, pressure: 1600, oxygen: 190 },
    { date: "2024-10-01", temperature: 27.1, salinity: 35.3, pressure: 1500, oxygen: 175 },
    { date: "2024-11-01", temperature: 26.5, salinity: 35.4, pressure: 1400, oxygen: 170 },
    { date: "2024-12-01", temperature: 25.9, salinity: 35.5, pressure: 1300, oxygen: 165 },
    { date: "2025-01-01", temperature: 26.2, salinity: 35.3, pressure: 1200, oxygen: 160 },
  ],
  INCOIS_2901003: [
    {
      date: "2024-07-01",
      temperature: 28.1,
      salinity: 34.9,
      pressure: 1500,
      oxygen: 200,
      pH: 8.1,
      nitrate: 12.5,
      chlorophyll: 0.8,
    },
    {
      date: "2024-08-01",
      temperature: 29.2,
      salinity: 34.8,
      pressure: 1400,
      oxygen: 205,
      pH: 8.2,
      nitrate: 13.0,
      chlorophyll: 0.9,
    },
    {
      date: "2024-09-01",
      temperature: 30.5,
      salinity: 34.7,
      pressure: 1300,
      oxygen: 210,
      pH: 8.3,
      nitrate: 13.5,
      chlorophyll: 1.0,
    },
    {
      date: "2024-10-01",
      temperature: 29.3,
      salinity: 34.8,
      pressure: 1200,
      oxygen: 195,
      pH: 8.4,
      nitrate: 14.0,
      chlorophyll: 1.1,
    },
    {
      date: "2024-11-01",
      temperature: 28.8,
      salinity: 34.9,
      pressure: 1100,
      oxygen: 190,
      pH: 8.5,
      nitrate: 14.5,
      chlorophyll: 1.2,
    },
    {
      date: "2024-12-01",
      temperature: 28.2,
      salinity: 35.0,
      pressure: 1000,
      oxygen: 185,
      pH: 8.6,
      nitrate: 15.0,
      chlorophyll: 1.3,
    },
    {
      date: "2025-01-01",
      temperature: 28.8,
      salinity: 34.8,
      pressure: 900,
      oxygen: 180,
      pH: 8.7,
      nitrate: 15.5,
      chlorophyll: 1.4,
    },
  ],
  INCOIS_2901004: [
    { date: "2024-07-01", temperature: 23.3, salinity: 35.5, pressure: 1800, oxygen: 187 },
    { date: "2024-08-01", temperature: 24.4, salinity: 35.4, pressure: 1700, oxygen: 192 },
    { date: "2024-09-01", temperature: 25.8, salinity: 35.3, pressure: 1600, oxygen: 197 },
    { date: "2024-10-01", temperature: 24.7, salinity: 35.4, pressure: 1500, oxygen: 182 },
    { date: "2024-11-01", temperature: 23.9, salinity: 35.5, pressure: 1400, oxygen: 177 },
    { date: "2024-12-01", temperature: 23.3, salinity: 35.6, pressure: 1300, oxygen: 172 },
    { date: "2025-01-01", temperature: 23.8, salinity: 35.4, pressure: 1200, oxygen: 167 },
  ],
  INCOIS_2901005: [
    {
      date: "2024-07-01",
      temperature: 27.9,
      salinity: 34.7,
      pressure: 1600,
      oxygen: 192,
      pH: 8.0,
      nitrate: 12.0,
      chlorophyll: 0.7,
    },
    {
      date: "2024-08-01",
      temperature: 28.9,
      salinity: 34.6,
      pressure: 1500,
      oxygen: 197,
      pH: 8.1,
      nitrate: 12.5,
      chlorophyll: 0.8,
    },
    {
      date: "2024-09-01",
      temperature: 30.1,
      salinity: 34.5,
      pressure: 1400,
      oxygen: 202,
      pH: 8.2,
      nitrate: 13.0,
      chlorophyll: 0.9,
    },
    {
      date: "2024-10-01",
      temperature: 29.3,
      salinity: 34.6,
      pressure: 1300,
      oxygen: 187,
      pH: 8.3,
      nitrate: 13.5,
      chlorophyll: 1.0,
    },
    {
      date: "2024-11-01",
      temperature: 28.7,
      salinity: 34.7,
      pressure: 1200,
      oxygen: 182,
      pH: 8.4,
      nitrate: 14.0,
      chlorophyll: 1.1,
    },
    {
      date: "2024-12-01",
      temperature: 28.1,
      salinity: 34.8,
      pressure: 1100,
      oxygen: 177,
      pH: 8.5,
      nitrate: 14.5,
      chlorophyll: 1.2,
    },
    {
      date: "2025-01-01",
      temperature: 28.6,
      salinity: 34.6,
      pressure: 1000,
      oxygen: 172,
      pH: 8.6,
      nitrate: 15.0,
      chlorophyll: 1.3,
    },
  ],
  INCOIS_2901006: [
    { date: "2024-07-01", temperature: 21.1, salinity: 35.7, pressure: 1200, oxygen: 175 },
    { date: "2024-08-01", temperature: 22.2, salinity: 35.6, pressure: 1100, oxygen: 180 },
    { date: "2024-09-01", temperature: 23.5, salinity: 35.5, pressure: 1000, oxygen: 185 },
    { date: "2024-10-01", temperature: 22.7, salinity: 35.6, pressure: 900, oxygen: 170 },
    { date: "2024-11-01", temperature: 21.9, salinity: 35.7, pressure: 800, oxygen: 165 },
    { date: "2024-12-01", temperature: 21.3, salinity: 35.8, pressure: 700, oxygen: 160 },
    { date: "2025-01-01", temperature: 21.8, salinity: 35.6, pressure: 600, oxygen: 155 },
  ],
  INCOIS_2901007: [
    {
      date: "2024-07-01",
      temperature: 26.5,
      salinity: 35.1,
      pressure: 1900,
      oxygen: 188,
      pH: 8.0,
      nitrate: 12.0,
      chlorophyll: 0.7,
    },
    {
      date: "2024-08-01",
      temperature: 27.5,
      salinity: 35.0,
      pressure: 1800,
      oxygen: 193,
      pH: 8.1,
      nitrate: 12.5,
      chlorophyll: 0.8,
    },
    {
      date: "2024-09-01",
      temperature: 28.8,
      salinity: 34.9,
      pressure: 1700,
      oxygen: 198,
      pH: 8.2,
      nitrate: 13.0,
      chlorophyll: 0.9,
    },
    {
      date: "2024-10-01",
      temperature: 27.7,
      salinity: 35.0,
      pressure: 1600,
      oxygen: 183,
      pH: 8.3,
      nitrate: 13.5,
      chlorophyll: 1.0,
    },
    {
      date: "2024-11-01",
      temperature: 26.9,
      salinity: 35.1,
      pressure: 1500,
      oxygen: 178,
      pH: 8.4,
      nitrate: 14.0,
      chlorophyll: 1.1,
    },
    {
      date: "2024-12-01",
      temperature: 26.3,
      salinity: 35.2,
      pressure: 1400,
      oxygen: 173,
      pH: 8.5,
      nitrate: 14.5,
      chlorophyll: 1.2,
    },
    {
      date: "2025-01-01",
      temperature: 26.8,
      salinity: 35.0,
      pressure: 1300,
      oxygen: 168,
      pH: 8.6,
      nitrate: 15.0,
      chlorophyll: 1.3,
    },
  ],
  INCOIS_2901008: [
    { date: "2024-07-01", temperature: 24.8, salinity: 35.0, pressure: 1700, oxygen: 183 },
    { date: "2024-08-01", temperature: 25.8, salinity: 34.9, pressure: 1600, oxygen: 188 },
    { date: "2024-09-01", temperature: 27.1, salinity: 34.8, pressure: 1500, oxygen: 193 },
    { date: "2024-10-01", temperature: 26.1, salinity: 34.9, pressure: 1400, oxygen: 178 },
    { date: "2024-11-01", temperature: 25.5, salinity: 35.0, pressure: 1300, oxygen: 173 },
    { date: "2024-12-01", temperature: 24.9, salinity: 35.1, pressure: 1200, oxygen: 168 },
    { date: "2025-01-01", temperature: 25.3, salinity: 34.9, pressure: 1100, oxygen: 163 },
  ],
  INCOIS_2901009: [
    {
      date: "2024-07-01",
      temperature: 28.8,
      salinity: 34.8,
      pressure: 1400,
      oxygen: 200,
      pH: 8.1,
      nitrate: 12.5,
      chlorophyll: 0.8,
    },
    {
      date: "2024-08-01",
      temperature: 29.8,
      salinity: 34.7,
      pressure: 1300,
      oxygen: 205,
      pH: 8.2,
      nitrate: 13.0,
      chlorophyll: 0.9,
    },
    {
      date: "2024-09-01",
      temperature: 31.1,
      salinity: 34.6,
      pressure: 1200,
      oxygen: 210,
      pH: 8.3,
      nitrate: 13.5,
      chlorophyll: 1.0,
    },
    {
      date: "2024-10-01",
      temperature: 30.3,
      salinity: 34.7,
      pressure: 1100,
      oxygen: 195,
      pH: 8.4,
      nitrate: 14.0,
      chlorophyll: 1.1,
    },
    {
      date: "2024-11-01",
      temperature: 29.7,
      salinity: 34.8,
      pressure: 1000,
      oxygen: 190,
      pH: 8.5,
      nitrate: 14.5,
      chlorophyll: 1.2,
    },
    {
      date: "2024-12-01",
      temperature: 29.1,
      salinity: 34.9,
      pressure: 900,
      oxygen: 185,
      pH: 8.6,
      nitrate: 15.0,
      chlorophyll: 1.3,
    },
    {
      date: "2025-01-01",
      temperature: 29.5,
      salinity: 34.7,
      pressure: 800,
      oxygen: 180,
      pH: 8.7,
      nitrate: 15.5,
      chlorophyll: 1.4,
    },
  ],
  INCOIS_2901010: [
    { date: "2024-07-01", temperature: 19.5, salinity: 35.9, pressure: 2000, oxygen: 178 },
    { date: "2024-08-01", temperature: 20.4, salinity: 35.8, pressure: 1900, oxygen: 183 },
    { date: "2024-09-01", temperature: 21.8, salinity: 35.7, pressure: 1800, oxygen: 188 },
    { date: "2024-10-01", temperature: 20.7, salinity: 35.8, pressure: 1700, oxygen: 173 },
    { date: "2024-11-01", temperature: 19.9, salinity: 35.9, pressure: 1600, oxygen: 168 },
    { date: "2024-12-01", temperature: 19.3, salinity: 36.0, pressure: 1500, oxygen: 163 },
    { date: "2025-01-01", temperature: 19.8, salinity: 35.8, pressure: 1400, oxygen: 158 },
  ],
}

export const mockTrajectoryData: Record<string, TrajectoryPoint[]> = {
  INCOIS_2901001: [
    {
      date: "2024-07-01",
      latitude: -10.5,
      longitude: 67.2,
      depth: 2000,
      temperature: 28.5,
      salinity: 35.1,
      pressure: 2000.5,
    },
    {
      date: "2024-08-01",
      latitude: -10.3,
      longitude: 67.4,
      depth: 1950,
      temperature: 28.2,
      salinity: 35.0,
      pressure: 1950.2,
    },
    {
      date: "2024-09-01",
      latitude: -10.1,
      longitude: 67.6,
      depth: 1900,
      temperature: 28.8,
      salinity: 34.9,
      pressure: 1900.8,
    },
    {
      date: "2024-10-01",
      latitude: -9.9,
      longitude: 67.8,
      depth: 1850,
      temperature: 29.1,
      salinity: 34.8,
      pressure: 1850.1,
    },
    {
      date: "2024-11-01",
      latitude: -9.7,
      longitude: 68.0,
      depth: 1800,
      temperature: 28.3,
      salinity: 34.9,
      pressure: 1800.3,
    },
    {
      date: "2024-12-01",
      latitude: -9.5,
      longitude: 68.2,
      depth: 1750,
      temperature: 27.8,
      salinity: 35.0,
      pressure: 1750.8,
    },
    {
      date: "2025-01-01",
      latitude: -9.3,
      longitude: 68.4,
      depth: 1700,
      temperature: 28.2,
      salinity: 35.1,
      pressure: 1700.2,
    },
  ],
  INCOIS_2901002: [
    {
      date: "2024-07-01",
      latitude: -15.8,
      longitude: 72.4,
      depth: 1800,
      temperature: 26.8,
      salinity: 35.3,
      pressure: 1800.2,
    },
    {
      date: "2024-08-01",
      latitude: -15.6,
      longitude: 72.6,
      depth: 1750,
      temperature: 26.5,
      salinity: 35.2,
      pressure: 1750.5,
    },
    {
      date: "2024-09-01",
      latitude: -15.4,
      longitude: 72.8,
      depth: 1700,
      temperature: 27.2,
      salinity: 35.1,
      pressure: 1700.2,
    },
    {
      date: "2024-10-01",
      latitude: -15.2,
      longitude: 73.0,
      depth: 1650,
      temperature: 27.1,
      salinity: 35.3,
      pressure: 1650.1,
    },
    {
      date: "2024-11-01",
      latitude: -15.0,
      longitude: 73.2,
      depth: 1600,
      temperature: 26.5,
      salinity: 35.4,
      pressure: 1600.5,
    },
    {
      date: "2024-12-01",
      latitude: -14.8,
      longitude: 73.4,
      depth: 1550,
      temperature: 25.9,
      salinity: 35.5,
      pressure: 1550.9,
    },
    {
      date: "2025-01-01",
      latitude: -14.6,
      longitude: 73.6,
      depth: 1500,
      temperature: 26.2,
      salinity: 35.3,
      pressure: 1500.2,
    },
  ],
  INCOIS_2901003: [
    {
      date: "2024-07-01",
      latitude: -5.2,
      longitude: 85.1,
      depth: 1500,
      temperature: 29.1,
      salinity: 34.8,
      pressure: 1500.8,
    },
    {
      date: "2024-08-01",
      latitude: -5.0,
      longitude: 85.3,
      depth: 1450,
      temperature: 29.2,
      salinity: 34.7,
      pressure: 1450.2,
    },
    {
      date: "2024-09-01",
      latitude: -4.8,
      longitude: 85.5,
      depth: 1400,
      temperature: 30.5,
      salinity: 34.6,
      pressure: 1400.5,
    },
    {
      date: "2024-10-01",
      latitude: -4.6,
      longitude: 85.7,
      depth: 1350,
      temperature: 29.3,
      salinity: 34.8,
      pressure: 1350.3,
    },
    {
      date: "2024-11-01",
      latitude: -4.4,
      longitude: 85.9,
      depth: 1300,
      temperature: 28.8,
      salinity: 34.9,
      pressure: 1300.8,
    },
    {
      date: "2024-12-01",
      latitude: -4.2,
      longitude: 86.1,
      depth: 1250,
      temperature: 28.2,
      salinity: 35.0,
      pressure: 1250.2,
    },
    {
      date: "2025-01-01",
      latitude: -4.0,
      longitude: 86.3,
      depth: 1200,
      temperature: 28.8,
      salinity: 34.8,
      pressure: 1200.8,
    },
  ],
}

export interface TrajectoryPoint {
  date: string
  latitude: number
  longitude: number
  depth: number
  temperature: number
  salinity: number
  pressure: number
}

export interface QualityControlStats {
  totalProfiles: number
  goodQuality: number
  questionableQuality: number
  badQuality: number
  missingData: number
  qualityPercentages: {
    good: number
    questionable: number
    bad: number
    missing: number
  }
  parameterQuality: {
    temperature: { good: number; questionable: number; bad: number }
    salinity: { good: number; questionable: number; bad: number }
    pressure: { good: number; questionable: number; bad: number }
    oxygen?: { good: number; questionable: number; bad: number }
  }
}

export function getFloatTrajectory(floatId: string): TrajectoryPoint[] {
  return mockTrajectoryData[floatId] || []
}

export function getQualityControlStats(filters?: any): QualityControlStats {
  // Mock quality control statistics
  const totalProfiles = 1250
  const goodQuality = 1125
  const questionableQuality = 87
  const badQuality = 25
  const missingData = 13

  return {
    totalProfiles,
    goodQuality,
    questionableQuality,
    badQuality,
    missingData,
    qualityPercentages: {
      good: Math.round((goodQuality / totalProfiles) * 100),
      questionable: Math.round((questionableQuality / totalProfiles) * 100),
      bad: Math.round((badQuality / totalProfiles) * 100),
      missing: Math.round((missingData / totalProfiles) * 100),
    },
    parameterQuality: {
      temperature: { good: 1140, questionable: 78, bad: 32 },
      salinity: { good: 1155, questionable: 65, bad: 30 },
      pressure: { good: 1180, questionable: 45, bad: 25 },
      oxygen: { good: 890, questionable: 45, bad: 15 },
    },
  }
}

export interface FilterOptions {
  region?: string
  parameter?: string
  dateRange?: {
    start: string
    end: string
  }
  status?: {
    active: boolean
    inactive: boolean
  }
  depthRange?: {
    min: number
    max: number
  }
}

export function filterFloats(floats: ArgoFloat[], filters: FilterOptions): ArgoFloat[] {
  return floats.filter((float) => {
    // Status filter
    if (filters.status) {
      if (!filters.status.active && float.status === "active") return false
      if (!filters.status.inactive && float.status === "inactive") return false
    }

    // Region filter (simplified - in real app would use proper geographic boundaries)
    if (filters.region) {
      const regionBounds = getRegionBounds(filters.region)
      if (regionBounds) {
        const { minLat, maxLat, minLng, maxLng } = regionBounds
        if (
          float.latitude < minLat ||
          float.latitude > maxLat ||
          float.longitude < minLng ||
          float.longitude > maxLng
        ) {
          return false
        }
      }
    }

    return true
  })
}

function getRegionBounds(region: string) {
  const regions: Record<string, { minLat: number; maxLat: number; minLng: number; maxLng: number }> = {
    "north-atlantic": { minLat: 30, maxLat: 60, minLng: -80, maxLng: -10 },
    "south-atlantic": { minLat: -60, maxLat: 0, minLng: -70, maxLng: 20 },
    "north-pacific": { minLat: 20, maxLat: 60, minLng: -180, maxLng: -100 },
    "south-pacific": { minLat: -60, maxLat: 0, minLng: -180, maxLng: -70 },
    "indian-ocean": { minLat: -40, maxLat: 25, minLng: 30, maxLng: 120 },
    arctic: { minLat: 60, maxLat: 90, minLng: -180, maxLng: 180 },
  }
  return regions[region]
}

export function getFloatProfile(floatId: string): ProfileData | null {
  return mockFloatProfiles[floatId] || null
}

export function getFloatTimeSeries(floatId: string): TimeSeriesData[] {
  return mockTimeSeriesDataByFloat[floatId] || []
}

export function calculateStatistics(floats: ArgoFloat[]) {
  const activeFloats = floats.filter((f) => f.status === "active")
  const inactiveFloats = floats.filter((f) => f.status === "inactive")

  const avgTemp = floats.reduce((sum, f) => sum + f.temperature, 0) / floats.length
  const avgSalinity = floats.reduce((sum, f) => sum + f.salinity, 0) / floats.length

  return {
    total: floats.length,
    active: activeFloats.length,
    inactive: inactiveFloats.length,
    avgTemperature: Number(avgTemp.toFixed(1)),
    avgSalinity: Number(avgSalinity.toFixed(1)),
  }
}
