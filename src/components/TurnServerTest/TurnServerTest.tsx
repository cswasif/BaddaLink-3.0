import { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material'
import { testTurnConnectivity, getCurrentTurnConfig } from 'utils/turnTestUtils'
import {
  testTurnOnlyConfig,
  testTurnPrioritizedConfig,
} from 'config/testTurnOnlyConfig'

/**
 * TURN Server Test Component
 *
 * This component provides a simple interface to test if your TURN server
 * is working correctly by forcing TURN-only connections.
 */
export const TurnServerTest = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  const [testStatus, setTestStatus] = useState<
    'idle' | 'running' | 'success' | 'failed'
  >('idle')
  const [currentConfig, setCurrentConfig] = useState<RTCConfiguration | null>(
    null
  )

  const runTurnTest = async () => {
    setIsTesting(true)
    setTestStatus('running')
    setTestResults(['🔄 Starting TURN server test...'])

    try {
      // Get current configuration from API
      setTestResults(prev => [
        ...prev,
        '📡 Fetching current TURN configuration...',
      ])
      const apiConfig = await getCurrentTurnConfig()
      setCurrentConfig(apiConfig)
      setTestResults(prev => [
        ...prev,
        `📋 Found ${apiConfig?.iceServers?.length || 0} ICE servers`,
      ])

      // Test with current configuration (forced relay)
      setTestResults(prev => [
        ...prev,
        '🧪 Testing with current configuration (relay-only)...',
      ])
      const relayOnlyConfig = {
        ...apiConfig,
        iceTransportPolicy: 'relay' as const,
      }
      const relayResult = await testTurnConnectivity(relayOnlyConfig)

      if (relayResult.success) {
        setTestResults(prev => [...prev, '✅ Relay-only test: SUCCESS'])
        setTestResults(prev => [
          ...prev,
          `📊 Found ${relayResult.candidates?.filter(c => c.type === 'relay').length || 0} relay candidates`,
        ])
      } else {
        setTestResults(prev => [...prev, '❌ Relay-only test: FAILED'])
        setTestResults(prev => [...prev, `⚠️ Message: ${relayResult.message}`])
      }

      // Test with TURN-only configuration (backup test)
      setTestResults(prev => [
        ...prev,
        '🧪 Testing with hardcoded TURN-only configuration...',
      ])
      const turnOnlyResult = await testTurnConnectivity(testTurnOnlyConfig)

      if (turnOnlyResult.success) {
        setTestResults(prev => [...prev, '✅ Hardcoded TURN test: SUCCESS'])
      } else {
        setTestResults(prev => [...prev, '❌ Hardcoded TURN test: FAILED'])
      }

      // Test with TURN-prioritized configuration
      setTestResults(prev => [
        ...prev,
        '🧪 Testing TURN-prioritized configuration...',
      ])
      const turnPrioritizedResult = await testTurnConnectivity(
        testTurnPrioritizedConfig
      )

      if (turnPrioritizedResult.success) {
        setTestResults(prev => [...prev, '✅ TURN-prioritized test: SUCCESS'])
      } else {
        setTestResults(prev => [...prev, '❌ TURN-prioritized test: FAILED'])
      }

      setTestStatus(relayResult.success ? 'success' : 'failed')
    } catch (error) {
      setTestResults(prev => [...prev, `❌ Test error: ${error}`])
      setTestStatus('failed')
    } finally {
      setIsTesting(false)
    }
  }

  const clearLogs = () => {
    setTestResults([])
    setTestStatus('idle')
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600 }}>
      <Typography variant="h5" gutterBottom>
        TURN Server Test Tool
      </Typography>

      <Typography variant="body1" paragraph>
        This tool tests if your TURN server is working by forcing TURN-only
        connections. It will attempt to establish a WebRTC connection using only
        the TURN relay server.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={runTurnTest}
          disabled={isTesting}
          sx={{ mr: 2 }}
        >
          {isTesting ? 'Testing...' : 'Test TURN Server'}
        </Button>

        <Button variant="outlined" onClick={clearLogs} disabled={isTesting}>
          Clear Logs
        </Button>
      </Box>

      {isTesting && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography>Testing TURN server connectivity...</Typography>
        </Box>
      )}

      {testStatus !== 'idle' && (
        <Alert
          severity={
            testStatus === 'success'
              ? 'success'
              : testStatus === 'failed'
                ? 'error'
                : 'info'
          }
          sx={{ mb: 2 }}
        >
          {testStatus === 'success'
            ? '✅ TURN server test PASSED'
            : testStatus === 'failed'
              ? '❌ TURN server test FAILED'
              : '🔄 TURN server test in progress'}
        </Alert>
      )}

      {currentConfig && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">Current Configuration:</Typography>
          <Typography variant="body2">
            {currentConfig?.iceServers?.length || 0} ICE servers configured
            {(currentConfig?.iceServers?.filter(s =>
              s.urls?.toString().includes('turn')
            )?.length || 0) > 0 &&
              ` (${currentConfig?.iceServers?.filter(s => s.urls?.toString().includes('turn'))?.length || 0} TURN servers)`}
          </Typography>
        </Alert>
      )}

      {testResults.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Test Results:
          </Typography>
          <Paper elevation={1} sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
            {testResults.map((result, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  mb: 0.5,
                  color: result.includes('✅')
                    ? 'success.main'
                    : result.includes('❌')
                      ? 'error.main'
                      : result.includes('🧪')
                        ? 'info.main'
                        : 'text.primary',
                }}
              >
                {result}
              </Typography>
            ))}
          </Paper>
        </Box>
      )}
    </Box>
  )
}
