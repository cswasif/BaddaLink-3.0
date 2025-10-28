/**
 * Optimized STUN Configuration Hook
 *
 * This hook provides automatic STUN server optimization for WebRTC connections.
 * It uses the StunOptimizer service to test STUN server connectivity and latency,
 * then automatically selects the best performing servers for reliable peer-to-peer connections.
 * Integrates with Cloudflare STUN Optimizer Worker for enhanced performance.
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  StunOptimizer,
  OptimizedStunConfig,
  StunTestResult,
} from 'services/StunOptimizer'
import { useTurnConfig } from 'hooks/useTurnConfig'

export interface UseOptimizedStunConfigReturn {
  rtcConfig: RTCConfiguration | undefined
  isOptimizing: boolean
  optimizationResults: StunTestResult[]
  lastOptimizationTime: number | null
  isStunOptimizationAvailable: boolean
  error: string | null
  forceReoptimize: () => Promise<void>
}

const STUN_OPTIMIZER_CONFIG = {
  timeout: 5000,
  maxServers: 3,
  testInterval: 300000, // 5 minutes
  enableBackgroundScan: true,
}

const QUERY_KEY = ['optimizedStunConfig']

export function useOptimizedStunConfig(
  enabled: boolean = true
): UseOptimizedStunConfigReturn {
  const optimizerRef = useRef<StunOptimizer | null>(null)
  const [isReoptimizing, setIsReoptimizing] = useState(false)
  const { turnConfig, isLoading: isTurnLoading } = useTurnConfig()

  // Initialize optimizer on mount
  useEffect(() => {
    if (enabled && !optimizerRef.current) {
      optimizerRef.current = StunOptimizer.getInstance(STUN_OPTIMIZER_CONFIG)
    }

    return () => {
      if (optimizerRef.current) {
        optimizerRef.current.stopBackgroundScan()
        optimizerRef.current = null
      }
    }
  }, [enabled])

  const optimizeStunServers =
    useCallback(async (): Promise<OptimizedStunConfig> => {
      if (!optimizerRef.current) {
        throw new Error('STUN optimizer not initialized')
      }

      // Get default STUN servers
      const defaultIceServers: RTCIceServer[] = [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.google.com:19302' },
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' },
      ]

      // If we have TURN config, merge it with STUN servers
      const serversToOptimize = turnConfig?.iceServers || defaultIceServers

      // Optimize STUN servers
      const optimizedConfig =
        await optimizerRef.current.getOptimizedStunServers(serversToOptimize)

      // Start background scanning if enabled
      if (STUN_OPTIMIZER_CONFIG.enableBackgroundScan) {
        optimizerRef.current.startBackgroundScan(serversToOptimize)
      }

      return optimizedConfig
    }, [turnConfig])

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: optimizeStunServers,
    enabled: enabled && !!optimizerRef.current && !isTurnLoading,
    staleTime: STUN_OPTIMIZER_CONFIG.testInterval,
    retry: 1,
    retryDelay: 2000,
  })

  const forceReoptimize = useCallback(async () => {
    if (!optimizerRef.current) return

    setIsReoptimizing(true)
    try {
      const serversToOptimize = turnConfig?.iceServers || [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.google.com:19302' },
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' },
      ]

      await optimizerRef.current.forceReoptimize(serversToOptimize)
      await refetch()
    } finally {
      setIsReoptimizing(false)
    }
  }, [turnConfig, refetch])

  // Create RTC configuration from optimized STUN servers
  const rtcConfig = data?.iceServers
    ? {
        iceServers: data.iceServers,
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all' as const,
      }
    : undefined

  return {
    rtcConfig,
    isOptimizing: isLoading || isReoptimizing,
    optimizationResults: data?.testResults || [],
    lastOptimizationTime: data?.timestamp || null,
    isStunOptimizationAvailable: enabled && !!data?.isOptimized,
    error: error?.message || null,
    forceReoptimize,
  }
}
