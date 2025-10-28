/**
 * Test Configuration for Forcing TURN Usage
 *
 * This configuration forces WebRTC to use TURN servers only,
 * bypassing STUN servers to test TURN functionality.
 *
 * WARNING: This should only be used for testing purposes as it
 * will disable direct P2P connections and force all traffic
 * through the TURN relay server.
 */

export const testTurnOnlyConfig: RTCConfiguration = {
  // Force TURN-only mode by setting iceTransportPolicy to 'relay'
  iceTransportPolicy: 'relay',

  iceServers: [
    // Only TURN servers - no STUN servers
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
        'nZ9q6GUDRXlIfz_L2ChN4gn7YLjKsYjmGtdZjUHE4LD7_JkKT1t79vF81IBqApLAAAAAAAAA',
      credential: 'ad044dc6-b36c-11f0-b302-0242ac140004',
    },
  ],

  // Additional ICE configuration for testing
  iceCandidatePoolSize: 10,
}

/**
 * Alternative test configuration that includes both STUN and TURN
 * but prioritizes TURN by ordering TURN servers first.
 * This is less restrictive than TURN-only mode.
 */
export const testTurnPrioritizedConfig: RTCConfiguration = {
  iceServers: [
    // TURN servers first (higher priority)
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
        'nZ9q6GUDRXlIfz_L2ChN4gn7YLjKsYjmGtdZjUHE4LD7_JkKT1t79vF81IBqApLAAAAAAAAA',
      credential: 'ad044dc6-b36c-11f0-b302-0242ac140004',
    },
    // STUN servers as fallback
    { urls: ['stun:stun.cloudflare.com:3478'] },
    { urls: ['stun:stun.l.google.com:19302'] },
    { urls: ['stun:stun1.l.google.com:19302'] },
    { urls: ['stun:stun2.l.google.com:19302'] },
    { urls: ['stun:stun.services.mozilla.com'] },
  ],

  iceCandidatePoolSize: 10,
}

/**
 * Test function to verify TURN server connectivity
 * This can be used to test if the TURN server is working
 */
export async function testTurnConnectivity(): Promise<boolean> {
  return new Promise(resolve => {
    const pc = new RTCPeerConnection(testTurnOnlyConfig)

    let turnWorking = false

    pc.onicecandidate = event => {
      if (event.candidate) {
        const candidate = event.candidate.candidate
        console.log('ICE Candidate:', candidate)

        // Check if this is a relay candidate (TURN)
        if (candidate.includes('typ relay')) {
          console.log('✅ TURN server is working! Got relay candidate.')
          turnWorking = true
          pc.close()
          resolve(true)
        }
      } else {
        // ICE gathering complete
        setTimeout(() => {
          pc.close()
          if (!turnWorking) {
            console.log('❌ No TURN relay candidates received.')
            resolve(false)
          }
        }, 1000)
      }
    }

    // Create data channel to trigger ICE gathering
    pc.createDataChannel('test')

    // Create offer to start ICE gathering
    pc.createOffer().then(offer => {
      pc.setLocalDescription(offer)
    })

    // Timeout after 10 seconds
    setTimeout(() => {
      pc.close()
      if (!turnWorking) {
        console.log('❌ TURN test timed out.')
        resolve(false)
      }
    }, 10000)
  })
}
