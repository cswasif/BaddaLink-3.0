/**
 * Optimized Tracker URLs Hook
 *
 * This hook provides automatic tracker optimization for WebRTC peer discovery.
 * It uses the TrackerOptimizer service to test tracker connectivity and latency,
 * then automatically selects the best performing trackers for reliable peer discovery.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrackerOptimizer,
  OptimizedTrackerConfig,
  TrackerTestResult,
} from 'services/TrackerOptimizer'
import { trackerUrls as defaultTrackerUrls } from 'config/trackerUrls'

export interface UseOptimizedTrackerUrlsReturn {
  trackerUrls: string[] | undefined
  isOptimizing: boolean
  optimizationResults: TrackerTestResult[]
  lastOptimizationTime: number | null
  isTrackerOptimizationAvailable: boolean
  error: string | null
  forceReoptimize: () => Promise<void>
}

const TRACKER_OPTIMIZER_CONFIG = {
  timeout: 3000,
  maxTrackers: 3,
  testInterval: 30000, // 30 seconds
  enableBackgroundScan: true,
}

const QUERY_KEY = ['optimizedTrackerUrls']

export function useOptimizedTrackerUrls(
  enabled: boolean = true
): UseOptimizedTrackerUrlsReturn {
  const optimizerRef = useRef<TrackerOptimizer | null>(null)
  const [isReoptimizing, setIsReoptimizing] = useState(false)

  // Initialize optimizer on mount
  useEffect(() => {
    if (enabled && !optimizerRef.current) {
      optimizerRef.current = TrackerOptimizer.getInstance(
        TRACKER_OPTIMIZER_CONFIG
      )
    }

    return () => {
      if (optimizerRef.current) {
        optimizerRef.current.stopBackgroundScan()
        optimizerRef.current = null
      }
    }
  }, [enabled])

  const optimizeTrackers =
    useCallback(async (): Promise<OptimizedTrackerConfig> => {
      if (!optimizerRef.current) {
        throw new Error('Tracker optimizer not initialized')
      }

      // Get all available tracker URLs
      const urls = defaultTrackerUrls || [
        'wss://tracker.openwebtorrent.com',
        'wss://tracker.openwebtorrent.com:443/announce',
      ]

      // Optimize trackers
      const optimizedConfig =
        await optimizerRef.current.getOptimizedTrackers(urls)

      // Start background scanning if enabled
      if (TRACKER_OPTIMIZER_CONFIG.enableBackgroundScan) {
        optimizerRef.current.startBackgroundScan(urls)
      }

      return optimizedConfig
    }, [])

  const forceReoptimize = useCallback(async () => {
    if (!optimizerRef.current) return

    setIsReoptimizing(true)
    try {
      await optimizerRef.current.forceReoptimize(
        defaultTrackerUrls || [
          'wss://tracker.openwebtorrent.com',
          'wss://tracker.openwebtorrent.com:443/announce',
        ]
      )
      await refetch()
    } finally {
      setIsReoptimizing(false)
    }
  }, [])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: optimizeTrackers,
    enabled: enabled && !!optimizerRef.current,
    staleTime: TRACKER_OPTIMIZER_CONFIG.testInterval,
    retry: 1,
    retryDelay: 2000,
  })

  return {
    trackerUrls: data?.urls || defaultTrackerUrls,
    isOptimizing: isLoading || isReoptimizing,
    optimizationResults: data?.testResults || [],
    lastOptimizationTime: data?.timestamp || null,
    isTrackerOptimizationAvailable: enabled && !!data?.isOptimized,
    error: error?.message || null,
    forceReoptimize,
  }
}
