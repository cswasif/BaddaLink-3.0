import { useContext } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useTheme from '@mui/material/styles/useTheme'
import { alpha } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import {
  Cached,
  Code,
  MeetingRoom,
  Key,
  TextFields,
  Public,
  Lock,
  Group,
  Security,
  Chat,
  Description,
  Gavel,
  BugReport,
  Stars,
  Assignment,
  Twitter,
  GitHub as GitHubIcon,
  Favorite as FavoriteIcon,
  Chat as ChatIcon,
} from '@mui/icons-material'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Fade from '@mui/material/Fade'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import InputAdornment from '@mui/material/InputAdornment'

import Logo from 'img/logo.svg?react'

import { EnhancedConnectivityControl } from 'components/EnhancedConnectivityControl'
import { SimpleMatchmakingButton } from 'components/SimpleMatchmaking'
import { SettingsContext } from 'contexts/SettingsContext'
import { RoomNameType } from 'lib/RoomNameGenerator'

import { isEnhancedConnectivityAvailable } from '../../config/enhancedConnectivity'

import { useHome } from './useHome'
import { EmbedCodeDialog } from './EmbedCodeDialog'
import { useOptimizedTrackerUrls } from 'hooks/useOptimizedTrackerUrls'

const StyledLogo = styled(Logo)({
  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
})

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  borderRadius: '24px',
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)'
      : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 100%)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(66, 165, 245, 0.2)'
        : '0 20px 40px rgba(0,0,0,0.1), 0 0 30px rgba(21, 101, 192, 0.15)',
    '& .feature-icon': {
      transform: 'scale(1.1) translateY(-2px)',
      filter: 'drop-shadow(0 0 10px currentColor)',
    },
    '& .feature-title': {
      color:
        theme.palette.mode === 'dark'
          ? theme.palette.primary.light
          : theme.palette.primary.main,
      textShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background:
      'linear-gradient(90deg, var(--feature-color-start) 0%, var(--feature-color-end) 100%)',
    opacity: 0.8,
    boxShadow: '0 0 10px var(--feature-color-start)',
  },
}))

const StyledForm = styled('form')(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.background.paper, 0.8)
      : alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}))

interface HomeProps {
  roomNameType?: RoomNameType
}

export function Home({ roomNameType }: HomeProps) {
  const theme = useTheme()
  const { updateUserSettings, getUserSettings } = useContext(SettingsContext)
  const { isEnhancedConnectivityEnabled } = getUserSettings()
  const {
    roomName,
    showEmbedCode,
    handleRoomNameChange,
    handleRoomNameTypeChange,
    regenerateRoomName,
    handleFormSubmit,
    handleJoinPublicRoomClick,
    handleJoinPrivateRoomClick,
    handleGetEmbedCodeClick,
    handleEmbedCodeWindowClose,
    isRoomNameValid,
  } = useHome()

  // Initialize tracker optimization in the background on homepage
  // This prevents delays when joining rooms
  useOptimizedTrackerUrls(isEnhancedConnectivityEnabled)

  return (
    <>
      <style>
        {`
          @keyframes pulse-glow {
            0% {
              box-shadow: 0 0 15px rgba(33, 150, 243, 0.3), 0 0 30px rgba(33, 150, 243, 0.1);
            }
            100% {
              box-shadow: 0 0 25px rgba(33, 150, 243, 0.5), 0 0 50px rgba(33, 150, 243, 0.3);
            }
          }
        `}
      </style>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
              : 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              pt: { xs: 4, sm: 6, md: 8 },
              pb: { xs: 6, sm: 8, md: 10 },
              textAlign: 'center',
            }}
          >
            <Fade in timeout={1000}>
              <Box sx={{ mb: 4 }}>
                <StyledLogo width={120} height={120} />
              </Box>
            </Fade>

            <Fade in timeout={1000} style={{ transitionDelay: '200ms' }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                  background:
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #64B5F6 30%, #2196F3 90%)'
                      : 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                Connect & Chat Securely
              </Typography>
            </Fade>

            <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{
                  mb: 4,
                  maxWidth: '800px',
                  mx: 'auto',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  lineHeight: 1.6,
                  px: 2,
                }}
              >
                Create private rooms for secure conversations, join public
                channels for open discussions, or start instant chats with
                end-to-end encryption. Your privacy is our priority.
              </Typography>
            </Fade>

            <Fade in timeout={1000} style={{ transitionDelay: '500ms' }}>
              <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <SimpleMatchmakingButton userId={getUserSettings().userId} />
              </Box>
            </Fade>

            <Fade in timeout={1000} style={{ transitionDelay: '600ms' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  mb: 6,
                  flexWrap: 'wrap',
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color:
                      theme.palette.mode === 'dark'
                        ? 'primary.light'
                        : 'primary.main',
                  }}
                >
                  <Security fontSize="small" /> End-to-End Encryption
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color:
                      theme.palette.mode === 'dark'
                        ? 'success.light'
                        : 'success.main',
                  }}
                >
                  <Group fontSize="small" /> Group & Private Chats
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    color:
                      theme.palette.mode === 'dark'
                        ? 'info.light'
                        : 'info.main',
                  }}
                >
                  <Chat fontSize="small" /> Real-time Messaging
                </Typography>
              </Box>
            </Fade>

            <Box sx={{ mb: 6 }}>
              <StyledForm onSubmit={handleFormSubmit}>
                <Typography
                  variant="h5"
                  sx={{
                    mb: 3,
                    background:
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(45deg, #64B5F6 30%, #2196F3 90%)'
                        : 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 600,
                  }}
                >
                  Create or Join a Room
                </Typography>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <TextField
                    value={roomName}
                    onChange={handleRoomNameChange}
                    placeholder={
                      roomNameType === RoomNameType.UUID
                        ? 'Enter UUID'
                        : 'Enter passphrase'
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MeetingRoom />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={regenerateRoomName} size="small">
                            <Cached />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </FormControl>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <ToggleButtonGroup
                    value={roomNameType}
                    exclusive
                    onChange={handleRoomNameTypeChange}
                    aria-label="room name type"
                    size="small"
                  >
                    <ToggleButton value={RoomNameType.UUID} aria-label="UUID">
                      <Key sx={{ mr: 1 }} /> UUID
                    </ToggleButton>
                    <ToggleButton
                      value={RoomNameType.PASSPHRASE}
                      aria-label="Passphrase"
                    >
                      <TextFields sx={{ mr: 1 }} /> Passphrase
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    mt: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleJoinPublicRoomClick}
                    disabled={!isRoomNameValid}
                    startIcon={<Public />}
                    sx={{
                      background:
                        'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                        transition: 'left 0.6s ease',
                      },
                      '&:hover::before': {
                        left: '100%',
                      },
                      '&:hover': {
                        background:
                          'linear-gradient(45deg, #1976D2 30%, #00B4D8 90%)',
                        boxShadow:
                          '0 0 25px rgba(33, 150, 243, 0.4), 0 0 50px rgba(33, 150, 243, 0.2)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Join Public Room
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleJoinPrivateRoomClick}
                    disabled={!isRoomNameValid}
                    startIcon={<Lock />}
                    sx={{
                      background:
                        'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
                      color: 'white',
                      '&:hover': {
                        background:
                          'linear-gradient(45deg, #388E3C 30%, #66BB6A 90%)',
                      },
                    }}
                  >
                    Join Private Room
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleGetEmbedCodeClick}
                    startIcon={<Code />}
                    fullWidth
                    sx={{
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(90deg, transparent, rgba(33, 150, 243, 0.2), transparent)',
                        transition: 'left 0.6s ease',
                      },
                      '&:hover::before': {
                        left: '100%',
                      },
                      '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        backgroundColor: 'rgba(33, 150, 243, 0.04)',
                        boxShadow: `0 0 25px ${alpha(theme.palette.primary.main, 0.4)}, 0 0 50px ${alpha(theme.palette.primary.main, 0.2)}`,
                        transform: 'translateY(-2px)',
                      },
                      animation: 'pulse-glow 2s ease-in-out infinite alternate',
                    }}
                  >
                    Get Embed Code
                  </Button>
                </Box>
              </StyledForm>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
                mt: 4,
              }}
            >
              <FeatureCard>
                <Security sx={{ fontSize: 48, color: '#4CAF50', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Secure & Private
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  End-to-end encryption ensures your conversations remain
                  private and secure.
                </Typography>
              </FeatureCard>
              <FeatureCard>
                <Chat sx={{ fontSize: 48, color: '#2196F3', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Real-time Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Instant messaging with no delays. Perfect for quick
                  conversations and team collaboration.
                </Typography>
              </FeatureCard>
              <FeatureCard>
                <Group sx={{ fontSize: 48, color: '#9C27B0', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Group Chats
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create rooms for multiple participants. Perfect for team
                  meetings and group discussions.
                </Typography>
              </FeatureCard>
            </Box>

            {isEnhancedConnectivityAvailable && (
              <Box sx={{ mt: 4 }}>
                <EnhancedConnectivityControl
                  isEnabled={isEnhancedConnectivityEnabled}
                  onChange={(_event, newValue) => {
                    updateUserSettings({
                      isEnhancedConnectivityEnabled: newValue,
                    })
                  }}
                />
              </Box>
            )}

            <EmbedCodeDialog
              showEmbedCode={showEmbedCode}
              handleEmbedCodeWindowClose={handleEmbedCodeWindowClose}
              roomName={roomName}
            />
          </Box>

          <Box
            component="footer"
            sx={{
              py: 4,
              mt: 'auto',
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(180deg, rgba(18,18,18,0.8) 0%, rgba(18,18,18,0.9) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.9) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Container maxWidth="lg">
              <Grid container spacing={4}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ mb: 2 }}>
                    <StyledLogo width={40} height={40} />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, maxWidth: 300 }}
                  >
                    Secure, real-time communication platform for teams and
                    individuals. End-to-end encrypted chats for your privacy.
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <IconButton
                      href="https://github.com/md-wasif-faisal/BaddaLink-Cloudflare"
                      target="_blank"
                      color="inherit"
                      size="small"
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          color: theme.palette.primary.main,
                          transform: 'scale(1.2)',
                          boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                      }}
                    >
                      <GitHubIcon />
                    </IconButton>
                    <IconButton
                      href="https://twitter.com/BaddaLink"
                      target="_blank"
                      color="inherit"
                      size="small"
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          color: theme.palette.primary.main,
                          transform: 'scale(1.2)',
                          boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                      }}
                    >
                      <Twitter />
                    </IconButton>
                    <IconButton
                      href="https://discord.gg/baddalink"
                      target="_blank"
                      color="inherit"
                      size="small"
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.1
                          ),
                          color: theme.palette.primary.main,
                          transform: 'scale(1.2)',
                          boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                      }}
                    >
                      <ChatIcon />
                    </IconButton>
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography
                    variant="subtitle2"
                    color="text.primary"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Resources
                  </Typography>
                  <Stack spacing={1}>
                    <Link
                      href="https://github.com/md-wasif-faisal/BaddaLink-Cloudflare/blob/main/README.md"
                      target="_blank"
                      color="inherit"
                      underline="hover"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Description fontSize="small" /> Documentation
                    </Link>
                    <Link
                      href="https://github.com/md-wasif-faisal/BaddaLink-Cloudflare/blob/main/LICENSE"
                      target="_blank"
                      color="inherit"
                      underline="hover"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Gavel fontSize="small" /> License
                    </Link>
                    <Link
                      href="https://github.com/md-wasif-faisal/BaddaLink-Cloudflare/issues"
                      target="_blank"
                      color="inherit"
                      underline="hover"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <BugReport fontSize="small" /> Report an Issue
                    </Link>
                  </Stack>
                </Grid>

                <Grid item xs={6} sm={4}>
                  <Typography
                    variant="subtitle2"
                    color="text.primary"
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    Quick Links
                  </Typography>
                  <Stack spacing={1}>
                    <Link
                      href="https://baddalink.pages.dev/features"
                      color="inherit"
                      underline="hover"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Stars fontSize="small" /> Features
                    </Link>
                    <Link
                      href="https://baddalink.pages.dev/privacy"
                      color="inherit"
                      underline="hover"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Security fontSize="small" /> Privacy Policy
                    </Link>
                    <Link
                      href="https://baddalink.pages.dev/terms"
                      color="inherit"
                      underline="hover"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        fontSize: '0.875rem',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: theme.palette.primary.main,
                          textShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Assignment fontSize="small" /> Terms of Service
                    </Link>
                  </Stack>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 4,
                  pt: 2,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} BaddaLink. All rights reserved.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Made with{' '}
                  <FavoriteIcon
                    sx={{
                      fontSize: 16,
                      color: '#ff1744',
                      verticalAlign: 'text-bottom',
                    }}
                  />{' '}
                  by the BaddaLink Team
                </Typography>
              </Box>
            </Container>
          </Box>
        </Container>
      </Box>
    </>
  )
}
