/**
 * Tracker Optimizer Service
 *
 * This service provides automatic tracker optimization for WebRTC peer discovery.
 * It tests multiple tracker URLs for connectivity and latency, then selects
 * the best performing ones for reliable peer discovery across different networks.
 */

export interface TrackerTestResult {
  url: string
  latency: number
  status: 'connected' | 'failed' | 'timeout'
  error?: string
}

export interface OptimizedTrackerConfig {
  urls: string[]
  testResults: TrackerTestResult[]
  timestamp: number
  isOptimized: boolean
}

export interface TrackerOptimizerConfig {
  timeout?: number
  maxTrackers?: number
  testInterval?: number
  enableBackgroundScan?: boolean
  trackerOptimizerUrl?: string
}

export class TrackerOptimizer {
  private static instance: TrackerOptimizer
  private optimizedConfig: OptimizedTrackerConfig | null = null
  private isTesting = false
  private backgroundInterval: NodeJS.Timeout | null = null
  private config: Required<TrackerOptimizerConfig>

  private readonly defaultConfig: Required<TrackerOptimizerConfig> = {
    timeout: 3000,
    maxTrackers: 3,
    testInterval: 30000, // 30 seconds
    enableBackgroundScan: true,
    trackerOptimizerUrl:
      'https://tracker-optimizer.md-wasif-faisal.workers.dev',
  }

  private constructor(config: TrackerOptimizerConfig = {}) {
    this.config = { ...this.defaultConfig, ...config }

    // Override with environment variable if available
    if (import.meta.env.VITE_TRACKER_OPTIMIZER_URL) {
      this.config.trackerOptimizerUrl =
        import.meta.env.VITE_TRACKER_OPTIMIZER_URL
    }
  }

  static getInstance(config?: TrackerOptimizerConfig): TrackerOptimizer {
    if (!TrackerOptimizer.instance) {
      TrackerOptimizer.instance = new TrackerOptimizer(config)
    }
    return TrackerOptimizer.instance
  }

  /**
   * Test a single tracker URL for connectivity and latency
   */
  private async testTracker(url: string): Promise<TrackerTestResult> {
    const startTime = Date.now()

    try {
      // Create a WebSocket connection to test the tracker
      const ws = new WebSocket(url)

      return new Promise(resolve => {
        const timeoutId = setTimeout(() => {
          ws.close()
          resolve({
            url,
            latency: this.config.timeout,
            status: 'timeout',
            error: 'Connection timeout',
          })
        }, this.config.timeout)

        ws.onopen = () => {
          const latency = Date.now() - startTime
          clearTimeout(timeoutId)
          ws.close()
          resolve({
            url,
            latency,
            status: 'connected',
          })
        }

        ws.onerror = error => {
          clearTimeout(timeoutId)
          resolve({
            url,
            latency: Date.now() - startTime,
            status: 'failed',
            error: error.type || 'WebSocket error',
          })
        }
      })
    } catch (error) {
      return {
        url,
        latency: Date.now() - startTime,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Fetch optimized trackers from Cloudflare Worker
   */
  private async fetchOptimizedTrackers(
    trackers: string[]
  ): Promise<TrackerTestResult[]> {
    if (!this.config.trackerOptimizerUrl) {
      return []
    }

    try {
      const response = await fetch(
        `${this.config.trackerOptimizerUrl}/optimize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            trackers,
            maxTrackers: this.config.maxTrackers,
            timeout: this.config.timeout,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Worker returned ${response.status}`)
      }

      const data = await response.json()
      return data.optimalTrackers || []
    } catch (error) {
      console.warn('Failed to fetch optimized trackers from worker:', error)
      return []
    }
  }

  /**
   * Test multiple tracker URLs in parallel
   */
  async testTrackers(urls: string[]): Promise<TrackerTestResult[]> {
    if (this.isTesting) {
      // Return cached results if currently testing
      return this.optimizedConfig?.testResults || []
    }

    this.isTesting = true

    try {
      // Try fetching optimized trackers from worker first
      const workerResults = await this.fetchOptimizedTrackers(urls)
      if (workerResults.length > 0) {
        return workerResults
      }

      // Fallback to local testing
      const results = await Promise.all(urls.map(url => this.testTracker(url)))
      return results
    } finally {
      this.isTesting = false
    }
  }

  /**
   * Create optimized tracker configuration from test results
   */
  private createOptimizedConfig(
    allUrls: string[],
    testResults: TrackerTestResult[]
  ): OptimizedTrackerConfig {
    // Sort by latency (fastest first)
    const successfulResults = testResults
      .filter(result => result.status === 'connected')
      .sort((a, b) => a.latency - b.latency)

    // Select top performers
    const selectedUrls = successfulResults
      .slice(0, this.config.maxTrackers)
      .map(result => result.url)

    // If no trackers work, fall back to original list
    const finalUrls = selectedUrls.length > 0 ? selectedUrls : allUrls

    return {
      urls: finalUrls,
      testResults,
      timestamp: Date.now(),
      isOptimized: selectedUrls.length > 0,
    }
  }

  /**
   * Get optimized tracker URLs
   */
  async getOptimizedTrackers(urls: string[]): Promise<OptimizedTrackerConfig> {
    // Return cached results if still fresh (within test interval)
    if (
      this.optimizedConfig &&
      Date.now() - this.optimizedConfig.timestamp < this.config.testInterval
    ) {
      return this.optimizedConfig
    }

    // Test all trackers
    const testResults = await this.testTrackers(urls)

    // Create optimized configuration
    this.optimizedConfig = this.createOptimizedConfig(urls, testResults)

    return this.optimizedConfig
  }

  /**
   * Force re-optimization (bypass cache)
   */
  async forceReoptimize(urls: string[]): Promise<OptimizedTrackerConfig> {
    this.optimizedConfig = null
    return this.getOptimizedTrackers(urls)
  }

  /**
   * Get current optimization status
   */
  getStatus() {
    return {
      isOptimized: this.optimizedConfig?.isOptimized || false,
      lastTestTime: this.optimizedConfig?.timestamp || null,
      allResults: this.optimizedConfig?.testResults || [],
      isBackgroundScanEnabled: this.config.enableBackgroundScan,
      isBackgroundScanActive: !!this.backgroundInterval,
    }
  }

  /**
   * Start background scanning
   */
  startBackgroundScan(urls: string[]): void {
    if (!this.config.enableBackgroundScan || this.backgroundInterval) {
      return
    }

    // Skip background scanning if worker is available
    if (this.config.trackerOptimizerUrl) {
      console.log(
        'Tracker optimizer worker available, skipping local background scanning'
      )
      return
    }

    this.backgroundInterval = setInterval(async () => {
      try {
        await this.getOptimizedTrackers(urls)
      } catch (error) {
        console.warn('Background tracker scan failed:', error)
      }
    }, this.config.testInterval)
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
   * Cleanup resources
   */
  destroy(): void {
    this.stopBackgroundScan()
    this.optimizedConfig = null
    TrackerOptimizer.instance = null as any
  }
}
