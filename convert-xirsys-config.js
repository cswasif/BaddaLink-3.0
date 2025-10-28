// Simple script to convert Xirsys config to base64 for RTC_CONFIG
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Read the JSON configuration
const configPath = path.join(__dirname, 'xirsys-config.json')
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

// Convert to base64
const configJson = JSON.stringify(config)
const base64Config = Buffer.from(configJson).toString('base64')

console.log('🎯 Xirsys TURN + STUN Configuration')
console.log('=====================================')
console.log('\n📋 Configuration Preview:')
console.log(JSON.stringify(config, null, 2))
console.log('\n🔑 Base64 encoded (set as RTC_CONFIG environment variable):')
console.log(base64Config)
console.log('\n💡 Usage:')
console.log('Set this as your RTC_CONFIG environment variable:')
console.log(`RTC_CONFIG="${base64Config}"`)
console.log('\n✅ This configuration includes:')
console.log('- All existing STUN servers (Google, Cloudflare, Mozilla)')
console.log('- STUN optimization will still work')
console.log('- Xirsys TURN servers as fallback when P2P fails')
console.log('- Multiple transport protocols (UDP/TCP/TLS) for reliability')
