import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'

import { useSimpleMatchmaking } from 'hooks/useSimpleMatchmaking'

interface SimpleMatchmakingButtonProps {
  userId: string
}

export function SimpleMatchmakingButton({
  userId,
}: SimpleMatchmakingButtonProps) {
  const {
    isSearching,
    isMatched,
    partnerId,
    roomId,
    error,
    findPartner,
    cancelSearch,
  } = useSimpleMatchmaking(userId)

  const handleFindPartner = async () => {
    try {
      await findPartner()
    } catch (err) {
      console.error('Failed to find partner:', err)
    }
  }

  const getStatusText = (): string => {
    if (error) return error
    if (isSearching) return 'Looking for someone to chat with...'
    if (isMatched && roomId) return 'Found a partner! Connecting...'
    if (isMatched) return 'Partner found!'
    return 'Talk to a stranger'
  }

  const isActionDisabled = (): boolean => {
    return isSearching || isMatched
  }

  // If already matched and have roomId, we're navigating to the room
  if (isMatched && roomId) {
    return (
      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Found a partner! Connecting to room...
        </Alert>
        <CircularProgress size={24} />
      </Box>
    )
  }

  return (
    <Box sx={{ textAlign: 'center', mt: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {getStatusText()}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={isSearching ? cancelSearch : handleFindPartner}
          disabled={isActionDisabled()}
          startIcon={isSearching ? undefined : undefined}
          sx={{
            backgroundColor: isSearching ? 'error.main' : 'primary.main',
            '&:hover': {
              backgroundColor: isSearching ? 'error.dark' : 'primary.dark',
            },
          }}
        >
          {isSearching ? 'Cancel' : 'Talk to Stranger'}
          {isSearching && (
            <CircularProgress size={16} sx={{ ml: 1, color: 'white' }} />
          )}
        </Button>
      </Box>

      {partnerId && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: 'block' }}
        >
          Matched with: {partnerId}
        </Typography>
      )}
    </Box>
  )
}
