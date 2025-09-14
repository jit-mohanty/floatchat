"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import type { ArgoFloat, ProfileData, TimeSeriesData } from "@/lib/mock-data"

interface EnhancedFilters {
  region?: string
  minDepth?: number
  maxDepth?: number
  dateRange?: {
    start: string
    end: string
  }
  qualityControl?: {
    goodOnly: boolean
  }
  measurements?: {
    temperatureRange: { min: number; max: number }
    salinityRange: { min: number; max: number }
  }
}

export function useArgoFloats(filters?: EnhancedFilters) {
  const [floats, setFloats] = useState<ArgoFloat[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFloats = async () => {
      setLoading(true)
      const { data, error } = await apiClient.getFloats(filters)

      if (error) {
        setError(error)
      } else {
        setFloats(data.floats)
        setStatistics(data.statistics)
        setError(null)
      }

      setLoading(false)
    }

    fetchFloats()
  }, [JSON.stringify(filters)])

  return { floats, statistics, loading, error }
}

export function useFloatProfile(floatId: string | null | undefined) {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!floatId) {
      setProfile(null)
      setLoading(false)
      setError(null)
      return
    }

    const fetchProfile = async () => {
      setLoading(true)
      const { data, error } = await apiClient.getFloatProfile(floatId)

      if (error) {
        setError(error)
        setProfile(null)
      } else {
        setProfile(data.profile)
        setError(null)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [floatId])

  return { profile, loading, error }
}

export function useFloatTimeSeries(floatId: string | null | undefined, dateRange?: { start?: string; end?: string }) {
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!floatId) {
      setTimeSeries([])
      setLoading(false)
      setError(null)
      return
    }

    const fetchTimeSeries = async () => {
      setLoading(true)
      const { data, error } = await apiClient.getFloatTimeSeries(floatId, dateRange)

      if (error) {
        setError(error)
        setTimeSeries([])
      } else {
        setTimeSeries(data.timeSeries)
        setError(null)
      }

      setLoading(false)
    }

    fetchTimeSeries()
  }, [floatId, JSON.stringify(dateRange)])

  return { timeSeries, loading, error }
}

export function useFloatTrajectory(floatId: string | null | undefined, dateRange?: { start?: string; end?: string }) {
  const [trajectory, setTrajectory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!floatId) {
      setTrajectory([])
      setLoading(false)
      setError(null)
      return
    }

    const fetchTrajectory = async () => {
      setLoading(true)
      const { data, error } = await apiClient.getFloatTrajectory(floatId, dateRange)

      if (error) {
        setError(error)
        setTrajectory([])
      } else {
        setTrajectory(data.trajectory)
        setError(null)
      }

      setLoading(false)
    }

    fetchTrajectory()
  }, [floatId, JSON.stringify(dateRange)])

  return { trajectory, loading, error }
}

export function useQualityControlStats(filters?: EnhancedFilters) {
  const [qualityStats, setQualityStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQualityStats = async () => {
      setLoading(true)
      const { data, error } = await apiClient.getQualityControlStats(filters)

      if (error) {
        setError(error)
        setQualityStats(null)
      } else {
        setQualityStats(data.qualityStats)
        setError(null)
      }

      setLoading(false)
    }

    fetchQualityStats()
  }, [JSON.stringify(filters)])

  return { qualityStats, loading, error }
}
