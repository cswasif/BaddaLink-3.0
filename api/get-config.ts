/**
 * Cloudflare Pages Function - Get TURN Configuration
 *
 * This function returns the TURN server configuration from the RTC_CONFIG environment variable.
 * The environment variable should contain a base64-encoded JSON string with the full RTCConfiguration.
 */

// Fallback TURN server configuration
const fallbackTurnServer = {
  urls: ['turn:relay1.expressturn.com:3480'],
  username: '000000002073803445',
  credential: '3iSwN8gOD2f0gLPEIw3MJCm6sRw=',
}

// Validate URL format for TURN servers
const isValidIceServerUrl = (url: string): boolean => {
  return /^(turn|turns):.+/.test(url)
}

// Validate RTCConfiguration
const isValidRTCConfiguration = (data: any): boolean => {
  if (!data || typeof data !== 'object') {
    console.error('RTC configuration is not a valid object')
    return false
  }

  if (!Array.isArray(data.iceServers)) {
    console.error('RTC configuration missing iceServers array')
    return false
  }

  if (data.iceServers.length === 0) {
    console.error('RTC configuration has empty iceServers array')
    return false
  }

  // Validate each ice server
  for (const server of data.iceServers) {
    if (!server || typeof server !== 'object') {
      console.error('Invalid ice server object:', server)
      return false
    }

    if (!server.urls) {
      console.error('Ice server missing urls property')
      return false
    }

    if (typeof server.urls !== 'string' && !Array.isArray(server.urls)) {
      console.error('Ice server urls must be string or array of strings')
      return false
    }

    const urlsArray = Array.isArray(server.urls) ? server.urls : [server.urls]

    if (
      !urlsArray.every(
        (url: any) => typeof url === 'string' && isValidIceServerUrl(url)
      )
    ) {
      console.error('Invalid ice server URLs:', urlsArray)
      return false
    }

    if (server.username !== undefined && typeof server.username !== 'string') {
      console.error('Ice server username must be a string')
      return false
    }

    if (
      server.credential !== undefined &&
      typeof server.credential !== 'string'
    ) {
      console.error('Ice server credential must be a string')
      return false
    }
  }

  return true
}

// Extract TURN server from RTCConfiguration
const extractTurnServer = (
  rtcConfig: RTCConfiguration
): RTCIceServer | null => {
  if (!rtcConfig.iceServers) {
    return null
  }

  for (const server of rtcConfig.iceServers) {
    const urls = Array.isArray(server.urls) ? server.urls : [server.urls]

    // Check if any of the URLs is a TURN server
    if (urls.some(url => url.startsWith('turn:'))) {
      return server
    }
  }

  return null
}

// Load and extract TURN server from environment variable
const getTurnServer = (env: any): RTCIceServer => {
  const rtcConfigEnv = env.RTC_CONFIG

  if (!rtcConfigEnv) {
    console.warn(
      'RTC_CONFIG environment variable is not set. Using fallback TURN server.'
    )
    return fallbackTurnServer
  }

  if (!rtcConfigEnv.trim()) {
    console.error(
      'RTC_CONFIG environment variable is empty. Using fallback TURN server.'
    )
    return fallbackTurnServer
  }

  try {
    // Base64 decode the environment variable
    const decodedConfig = atob(rtcConfigEnv)

    if (!decodedConfig.trim()) {
      console.error(
        'RTC_CONFIG environment variable decodes to empty string. Using fallback TURN server.'
      )
      return fallbackTurnServer
    }

    const parsedConfig = JSON.parse(decodedConfig)

    // Validate the parsed configuration
    if (!isValidRTCConfiguration(parsedConfig)) {
      console.error(
        'Invalid RTC configuration format in environment variable. Configuration must conform to RTCConfiguration interface. Using fallback TURN server.'
      )
      return fallbackTurnServer
    }

    // Extract TURN server from the configuration
    const turnServer = extractTurnServer(parsedConfig)
    if (!turnServer) {
      console.error(
        'No TURN server found in RTC configuration. Using fallback TURN server.'
      )
      return fallbackTurnServer
    }

    console.log(
      'Successfully loaded TURN server configuration from environment'
    )
    return turnServer
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(
        'Failed to parse RTC_CONFIG environment variable as JSON:',
        error.message,
        'Using fallback TURN server.'
      )
    } else {
      console.error(
        'Unexpected error processing RTC_CONFIG environment variable:',
        error,
        'Using fallback TURN server.'
      )
    }
    return fallbackTurnServer
  }
}

const allowedOrigins = [
  'https://chitchatter.im',
  'https://chitchatter.vercel.app',
  'https://chitchatter-git-develop-jeremyckahn.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3003',
]

export const onRequestGet = async (context: { request: Request; env: any }) => {
  console.log('API handler called for TURN configuration')

  const { request, env } = context
  const url = new URL(request.url)
  const origin = request.headers.get('origin')

  // Set CORS headers
  const headers = new Headers()
  headers.set('Content-Type', 'application/json')
  headers.set('Access-Control-Allow-Methods', 'GET')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')

  if (env.CORS_ALLOW_ALL === 'true') {
    // Debug mode: Allow all origins (insecure - for debugging only)
    headers.set('Access-Control-Allow-Origin', '*')
    console.log('CORS headers set with wildcard origin (DEBUG MODE - INSECURE)')
  } else {
    // Production mode: Restrict to allowed domains
    if (origin && allowedOrigins.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin)
    } else {
      // For same-origin requests or allowed deployments, use the primary domain
      headers.set('Access-Control-Allow-Origin', 'https://chitchatter.im')
    }
  }

  try {
    // Get TURN server from environment variable with validation
    const turnServer = getTurnServer(env)

    // Return the TURN server as JSON
    return new Response(JSON.stringify(turnServer), {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error('Unexpected error in API handler:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers,
    })
  }
}
