/**
 * TURN Server Test Utilities
 *
 * This file contains utility functions for testing TURN server connectivity
 * that can be used in the browser console or integrated into components.
 */

/**
 * Test TURN server connectivity by forcing relay-only connections
 */
export async function testTurnConnectivity(
  turnConfig: RTCConfiguration
): Promise<{
  success: boolean
  message: string
  candidates?: RTCIceCandidate[]
  error?: string
}> {
  return new Promise(resolve => {
    const pc = new RTCPeerConnection(turnConfig)
    const candidates: RTCIceCandidate[] = []
    let hasRelayCandidate = false

    // Create a data channel to trigger ICE gathering
    pc.createDataChannel('test')

    pc.onicecandidate = event => {
      if (event.candidate) {
        candidates.push(event.candidate)
        console.log(
          'ICE Candidate:',
          event.candidate.type,
          event.candidate.candidate
        )

        if (event.candidate.type === 'relay') {
          hasRelayCandidate = true
        }
      } else {
        // ICE gathering complete
        pc.close()

        if (hasRelayCandidate) {
          resolve({
            success: true,
            message: 'TURN server is working! Relay candidates were generated.',
            candidates,
          })
        } else {
          resolve({
            success: false,
            message:
              'No relay candidates found. TURN server may not be working.',
            candidates,
          })
        }
      }
    }

    pc.onicecandidateerror = error => {
      console.error('ICE candidate error:', error)
      pc.close()
      resolve({
        success: false,
        message: 'ICE candidate gathering failed',
        error: error.toString(),
      })
    }

    // Set a timeout to prevent hanging
    setTimeout(() => {
      pc.close()
      resolve({
        success: false,
        message: 'TURN test timed out after 10 seconds',
        candidates,
      })
    }, 10000)

    // Start the test
    pc.createOffer()
      .then(offer => {
        pc.setLocalDescription(offer)
      })
      .catch(error => {
        pc.close()
        resolve({
          success: false,
          message: 'Failed to create offer',
          error: error.toString(),
        })
      })
  })
}

/**
 * Get current TURN configuration from the API
 */
export async function getCurrentTurnConfig(): Promise<RTCConfiguration> {
  try {
    const response = await fetch('/api/get-config')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const config = await response.json()

    // Validate that it's a proper RTCConfiguration
    if (config && Array.isArray(config.iceServers)) {
      return config
    } else if (
      config &&
      config.rtcConfig &&
      Array.isArray(config.rtcConfig.iceServers)
    ) {
      return config.rtcConfig
    } else {
      throw new Error('Invalid RTC configuration format')
    }
  } catch (error) {
    console.warn('Failed to fetch TURN config from API, using fallback:', error)
    // Return a basic configuration that will work with the default setup
    return {
      iceServers: [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    }
  }
}

/**
 * Browser console helper function to test TURN connectivity
 * Usage: testTurn() in browser console
 */
export async function testTurn(): Promise<void> {
  console.log('🔄 Testing TURN server connectivity...')

  try {
    const config = await getCurrentTurnConfig()
    console.log('Using configuration:', config)

    // Force relay-only for testing
    const testConfig = {
      ...config,
      iceTransportPolicy: 'relay' as const,
    }

    console.log('Testing with relay-only policy...')
    const result = await testTurnConnectivity(testConfig)

    if (result.success) {
      console.log('✅ TURN Test Result:', result.message)
      console.log('ICE Candidates:', result.candidates)
    } else {
      console.warn('❌ TURN Test Result:', result.message)
      if (result.candidates) {
        console.log('ICE Candidates collected:', result.candidates)
      }
    }

    if (result.error) {
      console.error('Error details:', result.error)
    }
  } catch (error) {
    console.error('❌ TURN test failed:', error)
  }
}

// Make testTurn available globally for browser console usage
if (typeof window !== 'undefined') {
  ;(window as any).testTurn = testTurn
}
