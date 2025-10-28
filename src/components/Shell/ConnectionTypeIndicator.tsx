import Circle from '@mui/icons-material/FiberManualRecord'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Box } from '@mui/system'
import { useContext } from 'react'

import { SettingsContext } from 'contexts/SettingsContext'
import { ConnectionTestResults } from './useConnectionTest'

interface ConnectionTypeIndicatorProps {
  connectionTestResults: ConnectionTestResults
}

export const ConnectionTypeIndicator = ({
  connectionTestResults: { hasHost, hasTURNServer, trackerConnection },
}: ConnectionTypeIndicatorProps) => {
  const { getUserSettings } = useContext(SettingsContext)
  const { isEnhancedConnectivityEnabled } = getUserSettings()

  // Only show when tracker is connected and enhanced connectivity is enabled
  if (trackerConnection !== 'CONNECTED' || !isEnhancedConnectivityEnabled) {
    return null
  }

  // STUN is priority - show STUN if available, otherwise TURN
  const isUsingSTUN = hasHost
  const isUsingTURN = hasTURNServer && !hasHost // Only show TURN if STUN is not available

  if (isUsingSTUN) {
    return (
      <Tooltip title="Using STUN servers for direct peer connections (optimal performance)">
        <Typography
          variant="caption"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Box
            component="span"
            sx={theme => ({
              color: theme.palette.success.main,
              display: 'flex',
              alignItems: 'center',
            })}
          >
            <Circle sx={{ fontSize: 8 }} />
          </Box>
          STUN
        </Typography>
      </Tooltip>
    )
  }

  if (isUsingTURN) {
    return (
      <Tooltip title="Using TURN relay servers (fallback mode - may have higher latency)">
        <Typography
          variant="caption"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Box
            component="span"
            sx={theme => ({
              color: theme.palette.warning.main,
              display: 'flex',
              alignItems: 'center',
            })}
          >
            <Circle sx={{ fontSize: 8 }} />
          </Box>
          TURN
        </Typography>
      </Tooltip>
    )
  }

  return null
}
