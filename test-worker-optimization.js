// Test the worker optimization implementation
// This test should be run in the browser context, not Node.js

console.log('Testing Cloudflare Worker optimization...')

// Test STUN optimizer
console.log('\n=== Testing STUN Optimizer ===')

// Test Tracker optimizer
console.log('\n=== Testing Tracker Optimizer ===')

console.log('\n=== Summary ===')
console.log(
  'Both optimizers should now primarily use Cloudflare Workers instead of local background processes.'
)
console.log(
  'Check the browser console for any messages about worker availability and background scanning.'
)

async function testWorkerOptimization() {
  console.log('Testing Cloudflare Worker optimization...')

  // Test STUN optimizer
  console.log('\n=== Testing STUN Optimizer ===')
  const stunOptimizer = StunOptimizer.getInstance()

  const stunServers = [
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.google.com:19302' },
    { urls: 'stun:stun.mozilla.com:3478' },
  ]

  try {
    const optimizedStun =
      await stunOptimizer.getOptimizedStunServers(stunServers)
    console.log('STUN optimization results:', optimizedStun)

    if (optimizedStun.length > 0) {
      console.log('✅ STUN optimizer is working (likely using worker)')
    } else {
      console.log('❌ STUN optimizer returned empty results')
    }
  } catch (error) {
    console.error('❌ STUN optimizer failed:', error)
  }

  // Test Tracker optimizer
  console.log('\n=== Testing Tracker Optimizer ===')
  const trackerOptimizer = TrackerOptimizer.getInstance()

  const trackers = [
    'wss://tracker.openwebtorrent.com',
    'wss://tracker.files.fm:7073/announce',
    'wss://tracker.btorrent.xyz',
  ]

  try {
    const optimizedTrackers =
      await trackerOptimizer.getOptimizedTrackers(trackers)
    console.log('Tracker optimization results:', optimizedTrackers)

    if (optimizedTrackers.length > 0) {
      console.log('✅ Tracker optimizer is working (likely using worker)')
    } else {
      console.log('❌ Tracker optimizer returned empty results')
    }
  } catch (error) {
    console.error('❌ Tracker optimizer failed:', error)
  }

  console.log('\n=== Summary ===')
  console.log(
    'Both optimizers should now primarily use Cloudflare Workers instead of local background processes.'
  )
  console.log(
    'Check the browser console for any messages about worker availability and background scanning.'
  )
}

// Run the test
testWorkerOptimization().catch(console.error)
