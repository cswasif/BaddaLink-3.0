/**
 * Cloudflare Worker for Tracker Optimization
 * This worker handles tracker testing server-side to avoid browser WebSocket limits
 */

// CORS headers for cross-origin requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

// Add headers to response
function addCorsHeaders(response) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

// Handle CORS preflight requests
function handleOptions() {
  return addCorsHeaders(new Response(null, { status: 204 }))
}

// Test a single tracker URL for connectivity and latency
async function testTracker(trackerUrl) {
  const startTime = Date.now()
  const timeout = 3000 // 3 second timeout

  try {
    // Create a WebSocket connection to test the tracker
    // Note: Cloudflare Workers don't support WebSocket client connections,
    // so we'll use a basic HTTP connectivity test instead

    // Convert WebSocket URL to HTTP URL for testing
    const httpUrl = trackerUrl.replace(/^wss?:/, 'https:')

    // Test basic connectivity with a HEAD request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(httpUrl, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'BaddaLink-TrackerOptimizer/1.0',
        },
      })

      clearTimeout(timeoutId)
      const latency = Date.now() - startTime

      // If we get any response (even error), the server is reachable
      return {
        url: trackerUrl,
        latency,
        status: 'connected',
        timestamp: Date.now(),
      }
    } catch (error) {
      clearTimeout(timeoutId)

      // If it's a network error, the server is unreachable
      if (error.name === 'AbortError') {
        return {
          url: trackerUrl,
          latency: timeout,
          status: 'timeout',
          error: 'Connection timeout',
          timestamp: Date.now(),
        }
      }

      return {
        url: trackerUrl,
        latency: Date.now() - startTime,
        status: 'failed',
        error: error.message || 'Connection failed',
        timestamp: Date.now(),
      }
    }
  } catch (error) {
    return {
      url: trackerUrl,
      latency: Date.now() - startTime,
      status: 'failed',
      error: error.message || 'Unknown error',
      timestamp: Date.now(),
    }
  }
}

// Test multiple tracker URLs with connection limiting
async function testTrackers(trackerUrls, maxConcurrent = 3) {
  const results = []

  // Process in batches to limit concurrent connections
  for (let i = 0; i < trackerUrls.length; i += maxConcurrent) {
    const batch = trackerUrls.slice(i, i + maxConcurrent)
    const batchResults = await Promise.all(batch.map(url => testTracker(url)))
    results.push(...batchResults)

    // Small delay between batches to avoid overwhelming resources
    if (i + maxConcurrent < trackerUrls.length) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  return results
}

// Find the optimal tracker URLs from a list
async function findOptimalTrackers(trackerUrls, maxTrackers = 3) {
  try {
    const results = await testTrackers(trackerUrls)

    // Filter successful results
    const successfulResults = results.filter(
      result => result.status === 'connected'
    )

    if (successfulResults.length === 0) {
      return {
        optimal: [],
        results: results,
      }
    }

    // Sort by latency (fastest first) and take top performers
    const optimalTrackers = successfulResults
      .sort((a, b) => a.latency - b.latency)
      .slice(0, maxTrackers)
      .map(result => result.url)

    return {
      optimal: optimalTrackers,
      results: results,
    }
  } catch (error) {
    return {
      optimal: [],
      results: [],
      error: error.message,
    }
  }
}

// Main request handler
async function handleRequest(request) {
  try {
    const url = new URL(request.url)

    // Handle different endpoints
    if (url.pathname === '/optimize' && request.method === 'POST') {
      const body = await request.json()
      const { trackers, maxTrackers = 3, maxConcurrent = 3 } = body

      if (!trackers || !Array.isArray(trackers) || trackers.length === 0) {
        return addCorsHeaders(
          new Response(
            JSON.stringify({ error: 'Invalid or missing trackerUrls array' }),
            {
              status: 400,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        )
      }

      const result = await findOptimalTrackers(trackers, maxTrackers)

      return addCorsHeaders(
        new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return addCorsHeaders(
        new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    }

    // Default response
    return addCorsHeaders(
      new Response(
        JSON.stringify({
          message: 'Tracker Optimizer Worker',
          endpoints: {
            'POST /optimize': 'Optimize tracker URLs and find best performers',
            'GET /health': 'Health check',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )
  } catch (error) {
    return addCorsHeaders(
      new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    )
  }
}

// Export for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleOptions()
    }

    return handleRequest(request)
  },
}
