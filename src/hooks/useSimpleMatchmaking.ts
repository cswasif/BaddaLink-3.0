import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PeerRoom } from 'lib/PeerRoom'
import { trackerUrls } from 'config/trackerUrls'
import { selfId } from 'trystero/torrent'

export interface SimpleMatchmakingState {
  isSearching: boolean
  isMatched: boolean
  partnerId?: string
  roomId?: string
  error?: string
  isSupported: boolean
}

export interface UseSimpleMatchmakingReturn extends SimpleMatchmakingState {
  findPartner: () => Promise<void>
  cancelSearch: () => void
  reset: () => void
}

/**
 * Simple matchmaking hook that creates public rooms instead of private ones
 * This allows users to reconnect if they lose connection, unlike BaddaLink-2.0
 *
 * Technical approach:
 * 1. Users join a temporary "waiting room" to find partners
 * 2. When two users are matched, they both navigate to the same public room
 * 3. The room is public, so either user can rejoin later if they lose connection
 */
export function useSimpleMatchmaking(
  userId: string
): UseSimpleMatchmakingReturn {
  const navigate = useNavigate()
  const [isSearching, setIsSearching] = useState(false)
  const [isMatched, setIsMatched] = useState(false)
  const [partnerId, setPartnerId] = useState<string>()
  const [roomId, setRoomId] = useState<string>()
  const [error, setError] = useState<string>()
  const [isSupported] = useState(true) // Assume supported for now

  const waitingRoomRef = useRef<PeerRoom | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const isActiveRef = useRef(false)

  // Get the actual Trystero peer ID for this session
  const myPeerId = useRef(selfId).current

  // Cleanup function
  const cleanup = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
      searchTimeoutRef.current = undefined
    }

    if (waitingRoomRef.current) {
      waitingRoomRef.current.leaveRoom()
      waitingRoomRef.current = null
    }

    isActiveRef.current = false
  }, [])

  // Find a partner
  const findPartner = useCallback(async () => {
    if (isSearching || isMatched) return

    try {
      setIsSearching(true)
      setError(undefined)
      isActiveRef.current = true

      // Create temporary waiting room for finding partners
      // Use a fixed room that cycles every 10 seconds to increase chances of matching
      const timeSlot = Math.floor(Date.now() / 10000) // Changes every 10 seconds
      const waitingRoomId = `simple-matchmaking-slot-${timeSlot}`

      waitingRoomRef.current = new PeerRoom(
        {
          appId: `${encodeURI(window.location.origin)}_baddalink3`,
          relayUrls: trackerUrls,
        },
        waitingRoomId
      )

      console.log(`Joined matchmaking waiting room: ${waitingRoomId}`)
      console.log(
        `Current time: ${new Date().toISOString()}, Time slot: ${timeSlot}`
      )
      console.log(`My user ID: ${userId}`)
      console.log(`My peer ID: ${myPeerId}`)

      // Set up timeout (30 seconds)
      searchTimeoutRef.current = setTimeout(() => {
        if (isActiveRef.current && !isMatched) {
          setError('Timeout: No partner found')
          setIsSearching(false)
          cleanup()
        }
      }, 30000)

      // Listen for peers joining
      waitingRoomRef.current.onPeerJoin('NEW_PEER' as any, (peerId: string) => {
        if (!isActiveRef.current || isMatched) return
        console.log(`Peer joined waiting room: ${peerId}`)
        console.log(`My peer ID: ${myPeerId}, peer ID: ${peerId}`)
        if (peerId === myPeerId) return // Don't match with ourselves (same session)

        console.log(`Found potential partner: ${peerId}`)

        // Create a unique room name based on both peer IDs
        // Sort to ensure consistency (same room name for both users)
        const peerIds = [myPeerId, peerId].sort()
        const matchedRoomId = `matched-${peerIds[0]}-${peerIds[1]}`

        setPartnerId(peerId)
        setRoomId(matchedRoomId)
        setIsMatched(true)
        setIsSearching(false)

        // Navigate to the public room
        navigate(`/public/${matchedRoomId}`)

        cleanup()
      })

      // Also check for existing peers immediately (with a small delay to ensure connection is established)
      setTimeout(() => {
        if (!isActiveRef.current || isMatched) return

        const existingPeers = waitingRoomRef.current?.getPeers() || {}
        const peerIds = Object.keys(existingPeers).filter(id => id !== myPeerId)

        if (peerIds.length > 0) {
          // Found existing peer, match immediately
          const partnerPeerId = peerIds[0]
          console.log(`Found existing partner: ${partnerPeerId}`)

          const sortedPeerIds = [myPeerId, partnerPeerId].sort()
          const matchedRoomId = `matched-${sortedPeerIds[0]}-${sortedPeerIds[1]}`

          setPartnerId(partnerPeerId)
          setRoomId(matchedRoomId)
          setIsMatched(true)
          setIsSearching(false)

          navigate(`/public/${matchedRoomId}`)
          cleanup()
        } else {
          console.log(
            'No existing peers found in waiting room, waiting for someone to join...'
          )
        }
      }, 1000) // Wait 1 second for connection to establish
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to find partner'
      setError(errorMessage)
      setIsSearching(false)
      cleanup()
    }
  }, [isSearching, isMatched, userId, navigate, cleanup])

  // Cancel search
  const cancelSearch = useCallback(() => {
    if (!isSearching) return

    setIsSearching(false)
    setError(undefined)
    cleanup()
  }, [isSearching, cleanup])

  // Reset state
  const reset = useCallback(() => {
    setIsSearching(false)
    setIsMatched(false)
    setPartnerId(undefined)
    setRoomId(undefined)
    setError(undefined)
    cleanup()
  }, [cleanup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (waitingRoomRef.current) {
        waitingRoomRef.current.leaveRoom()
        waitingRoomRef.current = null
      }
    }
  }, [])

  return {
    isSearching,
    isMatched,
    partnerId,
    roomId,
    error,
    isSupported,
    findPartner,
    cancelSearch,
    reset,
  }
}
