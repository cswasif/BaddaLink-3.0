// Worker Optimization Test Component
// Add this to your browser console to test the optimization

export function testWorkerOptimization() {
  console.log('🧪 Testing Cloudflare Worker optimization...')

  // Test will be available in browser context
  if (typeof window !== 'undefined') {
    console.log('✅ Running in browser context')

    // Check if StunOptimizer is available
    if (
      (window as any).StunOptimizer ||
      (window as any).services?.StunOptimizer
    ) {
      console.log('✅ StunOptimizer service available')
    } else {
      console.log('❌ StunOptimizer service not found in global scope')
    }

    // Check if TrackerOptimizer is available
    if (
      (window as any).TrackerOptimizer ||
      (window as any).services?.TrackerOptimizer
    ) {
      console.log('✅ TrackerOptimizer service available')
    } else {
      console.log('❌ TrackerOptimizer service not found in global scope')
    }

    console.log('\n📋 To test the optimization:')
    console.log('1. Open the application in your browser')
    console.log('2. Open browser DevTools (F12)')
    console.log('3. Look for messages about:')
    console.log('   - "Fetching optimized STUN servers from worker"')
    console.log('   - "Fetching optimized trackers from worker"')
    console.log(
      '   - "STUN optimizer worker available, skipping local background scanning"'
    )
    console.log(
      '   - "Tracker optimizer worker available, skipping local background scanning"'
    )
    console.log(
      '4. These messages indicate the workers are being used instead of local background processes'
    )
  } else {
    console.log('❌ Not running in browser context')
  }
}

// Auto-run in browser
if (typeof window !== 'undefined') {
  testWorkerOptimization()
}
