/**
 * STUN Optimizer Service
 *
 * This service provides automatic STUN server optimization for WebRTC connections.
 * It tests multiple STUN server URLs for connectivity and latency, then selects
 * the best performing ones for reliable peer-to-peer connections across different networks.
 * Uses the Cloudflare STUN Optimizer Worker for enhanced performance.
 */

export interface StunTestResult {
  url: string
  latency: number
  status: 'connected' | 'failed' | 'timeout'
  error?: string
  serverInfo?: {
    type: 'stun' | 'turn'
    provider: string
  }
}

export interface OptimizedStunConfig {
  iceServers: RTCIceServer[]
  testResults: StunTestResult[]
  timestamp: number
  isOptimized: boolean
}

export interface StunOptimizerConfig {
  timeout?: number
  maxServers?: number
  testInterval?: number
  enableBackgroundScan?: boolean
  stunOptimizerUrl?: string
}

export class StunOptimizer {
  private static instance: StunOptimizer
  private optimizedConfig: OptimizedStunConfig | null = null
  private isTesting = false
  private backgroundInterval: NodeJS.Timeout | null = null
  private config: Required<StunOptimizerConfig>

  private readonly defaultConfig: Required<StunOptimizerConfig> = {
    timeout: 5000,
    maxServers: 3,
    testInterval: 300000, // 5 minutes
    enableBackgroundScan: true,
    stunOptimizerUrl: 'https://stun-optimizer.md-wasif-faisal.workers.dev',
  }

  private constructor(config: StunOptimizerConfig = {}) {
    this.config = { ...this.defaultConfig, ...config }

    // Override with environment variable if available
    if (import.meta.env.VITE_STUN_OPTIMIZER_URL) {
      this.config.stunOptimizerUrl = import.meta.env.VITE_STUN_OPTIMIZER_URL
    }
  }

  static getInstance(config?: StunOptimizerConfig): StunOptimizer {
    if (!StunOptimizer.instance) {
      StunOptimizer.instance = new StunOptimizer(config)
    }
    return StunOptimizer.instance
  }

  /**
   * Test a single STUN server for connectivity and latency
   */
  private async testStunServer(
    iceServer: RTCIceServer
  ): Promise<StunTestResult> {
    const startTime = Date.now()
    const url = typeof iceServer === 'string' ? iceServer : iceServer.urls
    const urls = Array.isArray(url) ? url : [url]

    try {
      // Create a peer connection to test the STUN server
      const pc = new RTCPeerConnection({
        iceServers: [iceServer],
        iceCandidatePoolSize: 0,
      })

      return new Promise(resolve => {
        const timeoutId = setTimeout(() => {
          pc.close()
          resolve({
            url: urls[0],
            latency: this.config.timeout,
            status: 'timeout',
            error: 'Connection timeout',
          })
        }, this.config.timeout)

        let candidateFound = false

        pc.onicecandidate = event => {
          if (event.candidate) {
            candidateFound = true
            const latency = Date.now() - startTime
            clearTimeout(timeoutId)
            pc.close()

            resolve({
              url: urls[0],
              latency,
              status: 'connected',
              serverInfo: {
                type: event.candidate.candidate.includes('relay')
                  ? 'turn'
                  : 'stun',
                provider: this.extractProvider(urls[0]),
              },
            })
          }
        }

        pc.onicecandidateerror = error => {
          if (!candidateFound) {
            clearTimeout(timeoutId)
            pc.close()
            resolve({
              url: urls[0],
              latency: Date.now() - startTime,
              status: 'failed',
              error: error.errorText || 'ICE candidate error',
            })
          }
        }

        // Create data channel to trigger ICE gathering
        pc.createDataChannel('test')
        pc.createOffer().then(offer => pc.setLocalDescription(offer))
      })
    } catch (error) {
      return {
        url: urls[0],
        latency: Date.now() - startTime,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Extract provider name from STUN/TURN URL
   */
  private extractProvider(url: string): string {
    if (url.includes('google')) return 'google'
    if (url.includes('cloudflare')) return 'cloudflare'
    if (url.includes('mozilla')) return 'mozilla'
    if (url.includes('twilio')) return 'twilio'
    if (url.includes('xirsys')) return 'xirsys'
    return 'unknown'
  }

  /**
   * Get optimized STUN servers from Cloudflare Worker
   */
  private async getOptimizedServersFromWorker(): Promise<RTCIceServer[]> {
    if (!this.config.stunOptimizerUrl) {
      return []
    }

    try {
      const response = await fetch(
        `${this.config.stunOptimizerUrl}/api/optimize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            region: 'auto',
            maxServers: this.config.maxServers,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.iceServers || []
    } catch (error) {
      console.warn('Failed to get optimized servers from worker:', error)
      return []
    }
  }

  /**
   * Test multiple STUN servers in parallel
   */
  async testStunServers(iceServers: RTCIceServer[]): Promise<StunTestResult[]> {
    if (this.isTesting) {
      return this.optimizedConfig?.testResults || []
    }

    this.isTesting = true

    try {
      // Test all servers in parallel
      const results = await Promise.all(
        iceServers.map(server => this.testStunServer(server))
      )
      return results
    } finally {
      this.isTesting = false
    }
  }

  /**
   * Get optimized STUN servers configuration
   */
  async getOptimizedStunServers(
    iceServers: RTCIceServer[]
  ): Promise<OptimizedStunConfig> {
    if (
      this.optimizedConfig &&
      Date.now() - this.optimizedConfig.timestamp < this.config.testInterval
    ) {
      return this.optimizedConfig
    }

    // Try to get optimized servers from Cloudflare Worker first
    let optimizedServers = await this.getOptimizedServersFromWorker()
    let testResults: StunTestResult[] = []

    // If worker fails, test provided servers locally
    if (optimizedServers.length === 0) {
      testResults = await this.testStunServers(iceServers)
      const successfulServers = testResults
        .filter(result => result.status === 'connected')
        .sort((a, b) => a.latency - b.latency)
        .slice(0, this.config.maxServers)
        .map(result => ({ urls: result.url }))

      optimizedServers =
        successfulServers.length > 0 ? successfulServers : iceServers
    } else {
      // Worker succeeded, test the optimized servers to verify
      testResults = await this.testStunServers(optimizedServers)
    }

    const successfulResults = testResults.filter(
      result => result.status === 'connected'
    )

    this.optimizedConfig = {
      iceServers: optimizedServers,
      testResults: successfulResults,
      timestamp: Date.now(),
      isOptimized: successfulResults.length > 0,
    }

    return this.optimizedConfig
  }

  /**
   * Force reoptimization of STUN servers
   */
  async forceReoptimize(
    iceServers: RTCIceServer[]
  ): Promise<OptimizedStunConfig> {
    this.optimizedConfig = null
    return this.getOptimizedStunServers(iceServers)
  }

  /**
   * Start background scanning (only when worker is not available)
   */
  startBackgroundScan(iceServers: RTCIceServer[]): void {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval)
    }

    // Only enable background scanning if worker URL is not configured or worker fails
    if (this.config.enableBackgroundScan && !this.config.stunOptimizerUrl) {
      this.backgroundInterval = setInterval(() => {
        this.getOptimizedStunServers(iceServers).catch(console.warn)
      }, this.config.testInterval)
    }
  }

  /**
   * Stop background scanning
   */
  stopBackgroundScan(): void {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval)
      this.backgroundInterval = null
    }
  }

  /**
   * Get current optimized configuration
   */
  getCurrentConfig(): OptimizedStunConfig | null {
    return this.optimizedConfig
  }

  /**
   * Reset optimizer state
   */
  reset(): void {
    this.stopBackgroundScan()
    this.optimizedConfig = null
    this.isTesting = false
  }

  /**
   * Destroy singleton instance
   */
  static destroyInstance(): void {
    if (StunOptimizer.instance) {
      StunOptimizer.instance.reset()
      StunOptimizer.instance = null as any
    }
  }
}
