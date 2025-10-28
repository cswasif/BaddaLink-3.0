import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { useTheme } from '@mui/material/styles'
import Zoom from '@mui/material/Zoom'
import { useWindowSize } from '@react-hook/window-size'
import { useContext, useMemo, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'

import { ChatTranscript } from 'components/ChatTranscript'
import { WholePageLoading } from 'components/Loading'
import { MessageForm } from 'components/MessageForm'
import { trackerUrls } from 'config/trackerUrls'
import { RoomContext } from 'contexts/RoomContext'
import { SettingsContext } from 'contexts/SettingsContext'
import { ShellContext } from 'contexts/ShellContext'
import { useTurnConfig } from 'hooks/useTurnConfig'
import { useOptimizedTrackerUrls } from 'hooks/useOptimizedTrackerUrls'
import { useOptimizedStunConfig } from 'hooks/useOptimizedStunConfig'
import { time } from 'lib/Time'
import { encryption } from 'services/Encryption'

import { RoomAudioControls } from './RoomAudioControls'
import { RoomFileUploadControls } from './RoomFileUploadControls'
import { RoomScreenShareControls } from './RoomScreenShareControls'
import { RoomShowMessagesControls } from './RoomShowMessagesControls'
import { RoomVideoControls } from './RoomVideoControls'
import { RoomVideoDisplay } from './RoomVideoDisplay'
import { TypingStatusBar } from './TypingStatusBar'
import { useRoom } from './useRoom'

export interface RoomProps {
  appId?: string
  getUuid?: typeof uuid
  password?: string
  roomId: string
  userId: string
  encryptionService?: typeof encryption
  timeService?: typeof time
  targetPeerId?: string
}

interface RoomInnerProps extends RoomProps {
  turnConfig: RTCConfiguration
  optimizedTrackerUrls?: string[]
}

const RoomCore = ({
  appId = `${encodeURI(window.location.origin)}_${process.env.VITE_NAME}`,
  getUuid = uuid,
  encryptionService = encryption,
  timeService = time,
  roomId,
  password,
  userId,
  targetPeerId,
  turnConfig,
  optimizedTrackerUrls,
}: RoomInnerProps) => {
  const theme = useTheme()
  const settingsContext = useContext(SettingsContext)
  const { showActiveTypingStatus, publicKey } =
    settingsContext.getUserSettings()

  const {
    isDirectMessageRoom,
    handleInlineMediaUpload,
    handleMessageChange,
    isMessageSending,
    messageLog,
    peerRoom,
    roomContextValue,
    sendMessage,
    showVideoDisplay,
  } = useRoom(
    {
      appId,
      relayUrls: optimizedTrackerUrls || trackerUrls,
      password,
      relayRedundancy: 4,
      turnConfig: turnConfig.iceServers,
      // NOTE: Avoid using STUN severs in the E2E tests in order to make them
      // run faster
      ...(import.meta.env.VITE_IS_E2E_TEST && {
        rtcConfig: {
          iceServers: [],
        },
      }),
    },
    {
      roomId,
      userId,
      getUuid,
      publicKey,
      encryptionService,
      timeService,
      targetPeerId,
    }
  )

  const { showRoomControls } = useContext(ShellContext)
  const [windowWidth, windowHeight] = useWindowSize()
  const landscape = windowWidth > windowHeight

  // Service Worker Auto-cleanup functionality
  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null)
  const [cleanupStatus, setCleanupStatus] = useState<string>('')

  // Register service worker for background cleanup
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register(
            '/auto-cleanup-sw.js'
          )
          setServiceWorkerRegistration(registration)

          // Start auto-cleanup immediately
          registration.active?.postMessage({ type: 'START_AUTO_CLEANUP' })
          setCleanupStatus('Auto-cleanup started')

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', event => {
            switch (event.data.type) {
              case 'AUTO_CLEANUP_PERFORMED':
                setCleanupStatus(
                  `Cleanup performed at ${new Date(event.data.timestamp).toLocaleTimeString()}`
                )
                break
              case 'AUTO_CLEANUP_ERROR':
                setCleanupStatus(`Cleanup error: ${event.data.error}`)
                break
              case 'AUTO_CLEANUP_STARTED':
                setCleanupStatus('Auto-cleanup active (5s intervals)')
                break
              case 'AUTO_CLEANUP_STOPPED':
                setCleanupStatus('Auto-cleanup stopped')
                break
            }
          })
        } catch (error) {
          console.error('Service Worker registration failed:', error)
          setCleanupStatus('Service Worker registration failed')
        }
      } else {
        setCleanupStatus('Service Workers not supported')
      }
    }

    registerServiceWorker()

    // Cleanup on unmount
    return () => {
      if (serviceWorkerRegistration) {
        serviceWorkerRegistration.active?.postMessage({
          type: 'STOP_AUTO_CLEANUP',
        })
      }
    }
  }, [])

  const handleMessageSubmit = async (message: string) => {
    await sendMessage(message)
  }

  const showMessages = roomContextValue.isShowingMessages

  // NOTE: If rtcConfig fails to load, the useRtcConfig hook provides a
  // fallback so the room will continue to work with default settings

  return (
    <RoomContext.Provider value={roomContextValue}>
      <Box
        className="Room"
        sx={{
          height: '100%',
          display: 'flex',
          flexGrow: '1',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: '1',
            overflow: 'auto',
          }}
        >
          {!isDirectMessageRoom && (
            <Zoom in={showRoomControls}>
              <Box
                sx={{
                  alignItems: 'flex-start',
                  display: 'flex',
                  justifyContent: 'center',
                  overflow: 'visible',
                  height: 0,
                  position: 'relative',
                  top: theme.spacing(1),
                }}
              >
                <RoomAudioControls peerRoom={peerRoom} />
                <RoomVideoControls peerRoom={peerRoom} />
                <RoomScreenShareControls peerRoom={peerRoom} />
                <RoomFileUploadControls
                  peerRoom={peerRoom}
                  onInlineMediaUpload={handleInlineMediaUpload}
                />
                <Zoom in={showVideoDisplay} mountOnEnter unmountOnExit>
                  <span>
                    <RoomShowMessagesControls />
                  </span>
                </Zoom>
              </Box>
            </Zoom>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: landscape ? 'row' : 'column',
              height: '100%',
              width: '100%',
              overflow: 'auto',
            }}
          >
            {showVideoDisplay && (
              <>
                <RoomVideoDisplay
                  userId={userId}
                  width="100%"
                  height={landscape || !showMessages ? '100%' : '60%'}
                />
                {/* Background cleanup status */}
                {cleanupStatus && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      zIndex: 1000,
                    }}
                  >
                    {cleanupStatus}
                  </div>
                )}
              </>
            )}
            {showMessages && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: '1',
                  width: showVideoDisplay && landscape ? '400px' : '100%',
                  height: landscape ? '100%' : '40%',
                }}
              >
                <ChatTranscript
                  messageLog={messageLog}
                  userId={userId}
                  sx={{ ...(isDirectMessageRoom && { pt: 1 }) }}
                />
                <Divider />
                <Box>
                  <MessageForm
                    onMessageSubmit={handleMessageSubmit}
                    isMessageSending={isMessageSending}
                    onMessageChange={handleMessageChange}
                  />
                  {showActiveTypingStatus ? (
                    <TypingStatusBar
                      isDirectMessageRoom={isDirectMessageRoom}
                    />
                  ) : null}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </RoomContext.Provider>
  )
}

export const Room = (props: RoomProps) => {
  const { isEnhancedConnectivityEnabled } =
    useContext(SettingsContext).getUserSettings()

  // Fetch rtcConfig from server
  const { turnConfig, isLoading: isConfigLoading } = useTurnConfig(
    isEnhancedConnectivityEnabled
  )

  // Use cached tracker URLs (optimization happens on homepage)
  // This prevents delays when joining rooms
  const {
    trackerUrls: optimizedTrackerUrls,
    isOptimizing: isTrackerOptimizing,
  } = useOptimizedTrackerUrls(false) // Don't trigger optimization in room

  // Get optimized STUN configuration
  const { rtcConfig: optimizedRtcConfig, isOptimizing: isStunOptimizing } =
    useOptimizedStunConfig(isEnhancedConnectivityEnabled)

  // Combine TURN and optimized STUN configurations
  const combinedRtcConfig = useMemo(() => {
    if (!isEnhancedConnectivityEnabled) {
      return turnConfig
    }

    // If we have optimized STUN config, merge it with TURN config
    if (
      optimizedRtcConfig &&
      optimizedRtcConfig.iceServers &&
      turnConfig.iceServers
    ) {
      return {
        ...optimizedRtcConfig,
        iceServers: [
          ...optimizedRtcConfig.iceServers,
          ...turnConfig.iceServers.filter((server: RTCIceServer) => {
            if (typeof server.urls === 'string') {
              return server.urls.includes('turn:')
            }
            if (Array.isArray(server.urls)) {
              return server.urls.some((url: string) => url.includes('turn:'))
            }
            return false
          }),
        ],
      }
    }

    return turnConfig
  }, [turnConfig, optimizedRtcConfig, isEnhancedConnectivityEnabled])

  const isLoading = isConfigLoading || isTrackerOptimizing || isStunOptimizing

  if (isLoading) {
    return <WholePageLoading />
  }

  return (
    <RoomCore
      {...props}
      turnConfig={combinedRtcConfig}
      optimizedTrackerUrls={optimizedTrackerUrls}
    />
  )
}
