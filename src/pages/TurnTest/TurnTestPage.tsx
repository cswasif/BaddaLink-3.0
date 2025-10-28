import { useState } from 'react'
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Alert,
  Divider,
} from '@mui/material'
import { TurnServerTest } from 'components/TurnServerTest'
import { useNavigate } from 'react-router-dom'

/**
 * TURN Server Test Page
 *
 * This page provides comprehensive testing tools for your TURN server configuration.
 * You can use this to verify that your TURN server is working correctly.
 */
export const TurnTestPage = () => {
  const navigate = useNavigate()
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          🔄 TURN Server Testing Tool
        </Typography>

        <Typography variant="body1" paragraph align="center">
          Test your TURN server configuration to ensure reliable peer-to-peer
          connections
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>What this test does:</strong> This tool forces your WebRTC
            connection to use only TURN servers (no direct P2P), which helps
            verify that your TURN relay is working correctly. A successful test
            means your TURN server can relay traffic when direct connections
            fail.
          </Typography>
        </Alert>

        <Divider sx={{ my: 3 }} />

        <TurnServerTest />

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setShowAdvanced(!showAdvanced)}
            sx={{ mr: 2 }}
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Info
          </Button>

          <Button variant="contained" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </Box>

        {showAdvanced && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Advanced Information
            </Typography>

            <Typography variant="body2" paragraph>
              <strong>Current TURN Configuration:</strong>
            </Typography>

            <Box
              component="pre"
              sx={{
                backgroundColor: 'grey.100',
                p: 2,
                borderRadius: 1,
                fontSize: '0.8rem',
                overflow: 'auto',
              }}
            >
              {`{
  "iceTransportPolicy": "relay",
  "iceServers": [
    {
      "urls": ["turn:relay1.expressturn.com:3480"],
      "username": "000000002073803445",
      "credential": "3iSwN8gOD2f0gLPEIw3MJCm6sRw="
    }
  ]
}`}
            </Box>

            <Typography variant="body2" paragraph sx={{ mt: 2 }}>
              <strong>What to expect:</strong>
            </Typography>

            <ul>
              <li>
                <Typography variant="body2">
                  <strong>Success:</strong> You should see relay candidates in
                  the logs (candidates with "typ relay")
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Failure:</strong> No relay candidates or connection
                  timeout
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Network Impact:</strong> This test will use your TURN
                  server for all traffic, which may be slower than direct P2P
                </Typography>
              </li>
            </ul>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
