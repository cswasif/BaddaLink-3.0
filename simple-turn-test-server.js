import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const PORT = 3004
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple HTTP server to serve the TURN test page
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Serve the TURN test page
  if (req.url === '/' || req.url === '/test-turn') {
    fs.readFile(
      path.join(__dirname, 'test-turn-standalone.html'),
      (err, data) => {
        if (err) {
          res.writeHead(500)
          res.end('Error loading test page')
          return
        }

        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(data)
      }
    )
  }
  // Mock API endpoint for TURN configuration
  else if (req.url === '/api/get-config') {
    const turnConfig = {
      urls: ['turn:relay1.expressturn.com:3480'],
      username: '000000002073803445',
      credential: '3iSwN8gOD2f0gLPEIw3MJCm6sRw=',
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(turnConfig))
  }
  // Health check
  else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() })
    )
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(PORT, () => {
  console.log(`🚀 TURN Test Server running on http://localhost:${PORT}`)
  console.log(`📋 Test page: http://localhost:${PORT}/test-turn`)
  console.log(`🔧 Mock API: http://localhost:${PORT}/api/get-config`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
  console.log('')
  console.log(
    'Click "Test TURN-Only" to force TURN usage and verify functionality.'
  )
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...')
  server.close(() => {
    console.log('✅ Server stopped')
    process.exit(0)
  })
})
