var __defProp = Object.defineProperty
var __name = (target, value) =>
  __defProp(target, 'name', { value, configurable: true })

// simple-api-bangladesh.js
var __defProp2 = Object.defineProperty
var __name2 = /* @__PURE__ */ __name(
  (target, value) => __defProp2(target, 'name', { value, configurable: true }),
  '__name'
)

function getBangladeshOptimizedConfig() {
  return {
    iceServers: [
      // Ultra-fast primary (Singapore) - TESTED WORKING
      {
        urls: ['stun:stun.cloudflare.com:3478'],
      },
      // Fast Google servers - ALL TESTED WORKING
      {
        urls: [
          'stun:stun.l.google.com:19302',
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
      // TURN servers for Bangladesh region
      {
        urls: [
          'turn:bn-turn1.xirsys.com:80?transport=udp',
          'turn:bn-turn1.xirsys.com:3478?transport=udp',
          'turn:bn-turn1.xirsys.com:80?transport=tcp',
          'turn:bn-turn1.xirsys.com:3478?transport=tcp',
          'turns:bn-turn1.xirsys.com:443?transport=tcp',
          'turns:bn-turn1.xirsys.com:5349?transport=tcp',
        ],
        username:
          'nZ9q6GUDRXlIfz_L2ChN4gn7YLjKsYjmGtdZjUHE4LD7_JkKT1t79vF81IBqApLAAAAAAAAAA',
        credential: 'ad044dc6-b36c-11f0-b302-0242ac140004',
      },
    ],
    iceCandidatePoolSize: 10,
    iceTransportPolicy: 'all',
  }
}
__name(getBangladeshOptimizedConfig, 'getBangladeshOptimizedConfig')
__name2(getBangladeshOptimizedConfig, 'getBangladeshOptimizedConfig')

function getBangladeshFallbackConfig() {
  return {
    iceServers: [
      {
        urls: [
          'stun:stun.cloudflare.com:3478',
          'stun:stun.l.google.com:19302',
          'stun:stun.services.mozilla.com:3478',
        ],
      },
      // Fallback TURN server
      {
        urls: ['turn:relay1.expressturn.com:3480'],
        username: '000000002073803445',
        credential: '3iSwN8gOD2f0gLPEIw3MJCm6sRw=',
      },
    ],
    iceCandidatePoolSize: 5,
    iceTransportPolicy: 'all',
  }
}
__name(getBangladeshFallbackConfig, 'getBangladeshFallbackConfig')
__name2(getBangladeshFallbackConfig, 'getBangladeshFallbackConfig')

function getRtcConfig(env) {
  try {
    console.log('Using Bangladesh-optimized RTC configuration')
    return getBangladeshOptimizedConfig()
  } catch (error) {
    console.log('Error loading Bangladesh config:', error.message)
  }
  console.log('Using Bangladesh fallback configuration')
  return getBangladeshFallbackConfig()
}
__name(getRtcConfig, 'getRtcConfig')
__name2(getRtcConfig, 'getRtcConfig')

function getCorsOrigin(request, env) {
  if (env.CORS_ALLOW_ALL === 'true') {
    return '*'
  }
  let origin = request.headers.get('origin')
  if (!origin) {
    origin =
      request.headers.get('Origin') ||
      request.headers.get('ORIGIN') ||
      request.headers.get('referer') ||
      request.headers.get('Referer')
  }
  if (!origin) {
    const userAgent = request.headers.get('user-agent') || ''
    if (
      userAgent.includes('Mozilla') ||
      userAgent.includes('Chrome') ||
      userAgent.includes('Safari') ||
      userAgent.includes('Firefox')
    ) {
      return 'https://baddalink.pages.dev'
    }
    return 'https://baddalink.pages.dev'
  }
  const normalizedOrigin = origin.toLowerCase().replace(/\/$/, '')
  console.log('CORS Debug - Bangladesh - Normalized origin:', normalizedOrigin)
  const allowedOrigins = [
    'https://baddalink.pages.dev',
    'https://baddalink2.pages.dev',
  ]
  if (allowedOrigins.includes(normalizedOrigin)) {
    return origin
  }
  if (normalizedOrigin.startsWith('http://localhost:')) {
    const port = normalizedOrigin.split(':')[2]
    const allowedPorts = ['3000', '3001', '3003', '5173']
    if (allowedPorts.includes(port)) {
      return origin
    }
  }
  return 'https://baddalink.pages.dev'
}
__name(getCorsOrigin, 'getCorsOrigin')
__name2(getCorsOrigin, 'getCorsOrigin')

async function handleGetConfig(request, env) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': getCorsOrigin(request, env),
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
  const startTime = Date.now()
  const rtcConfig = getRtcConfig(env)
  const responseTime = Date.now() - startTime
  console.log(`Bangladesh API response time: ${responseTime}ms`)
  const corsOrigin = getCorsOrigin(request, env)
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=300',
    'X-Response-Time': `${responseTime}ms`,
    'X-Region': 'Bangladesh-Optimized',
  })
  const response = {
    ...rtcConfig,
    _meta: {
      region: 'Bangladesh',
      optimized: true,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
    },
  }
  return new Response(JSON.stringify(response), {
    status: 200,
    headers,
  })
}
__name(handleGetConfig, 'handleGetConfig')
__name2(handleGetConfig, 'handleGetConfig')

async function handleHealthCheck(request, env) {
  const startTime = Date.now()
  const responseTime = Date.now() - startTime
  return new Response(
    JSON.stringify({
      status: 'ok',
      region: 'Bangladesh',
      optimized: true,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      note: 'Bangladesh-optimized STUN/TURN configuration',
      servers: {
        primary: 'Cloudflare Singapore STUN',
        regional: 'Singapore/Malaysia/India TURN',
        fallback: 'Global TURN servers',
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': getCorsOrigin(request, env),
        'Cache-Control': 'public, max-age=60',
        'X-Response-Time': `${responseTime}ms`,
      },
    }
  )
}
__name(handleHealthCheck, 'handleHealthCheck')
__name2(handleHealthCheck, 'handleHealthCheck')

var simple_api_bangladesh_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const startTime = Date.now()
    console.log(`🇧🇩 Bangladesh API: ${request.method} ${url.pathname}`)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': getCorsOrigin(request, env),
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }
    if (url.pathname === '/api/get-config') {
      return handleGetConfig(request, env)
    }
    if (url.pathname === '/health') {
      return handleHealthCheck(request, env)
    }
    if (url.pathname === '/') {
      const responseTime = Date.now() - startTime
      return new Response(
        JSON.stringify({
          service: 'Baddalink STUN/TURN API - Bangladesh Optimized',
          version: '2.1.0',
          region: 'Bangladesh',
          optimized: true,
          responseTime: `${responseTime}ms`,
          endpoints: {
            '/api/get-config':
              'Get Bangladesh-optimized WebRTC configuration with TURN',
            '/health': 'Health check with regional info',
          },
          features: {
            stunServers: 'Cloudflare Singapore + Google Global',
            turnServers: 'Regional TURN (Singapore/Malaysia/India)',
            optimizedFor: 'Dhaka, Bangladesh',
            latencyTarget: '<50ms',
            redundancy: 'Multi-region STUN + TURN fallback',
          },
          timestamp: new Date().toISOString(),
          note: 'Optimized for Bangladesh users - Singapore primary, regional TURN backup',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': getCorsOrigin(request, env),
            'Cache-Control': 'public, max-age=300',
            'X-Response-Time': `${responseTime}ms`,
          },
        }
      )
    }
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': getCorsOrigin(request, env),
      },
    })
  },
}
export { simple_api_bangladesh_default as default }
