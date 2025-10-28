import type { ThemeOptions } from '@mui/material/styles'
import type { CustomPaletteColorOptions } from '@mui/material/styles'
import './theme.d.ts'

// Enhanced oceanic theme with sophisticated, universally appealing colors
export const oceanicThemeTokens: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0', // Rich, sophisticated blue
      light: '#5e92f3',
      dark: '#003c8f',
      contrastText: '#ffffff',
      // Elegant gradient with depth
      gradient:
        'linear-gradient(135deg, rgba(21, 101, 192, 0.9), rgba(66, 165, 245, 0.8), rgba(144, 202, 249, 0.7))',
    } satisfies CustomPaletteColorOptions,
    secondary: {
      main: '#00838f', // Deep teal with sophistication
      light: '#4fb3bf',
      dark: '#005662',
      contrastText: '#ffffff',
      // Luxurious gradient
      gradient:
        'linear-gradient(135deg, rgba(0, 131, 143, 0.9), rgba(77, 182, 172, 0.8), rgba(128, 203, 196, 0.7))',
    } satisfies CustomPaletteColorOptions,
    highlight: {
      main: '#2e7d32', // Elegant forest green
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
      // Natural, organic gradient
      gradient:
        'linear-gradient(135deg, rgba(46, 125, 50, 0.9), rgba(102, 187, 106, 0.8), rgba(165, 214, 167, 0.7))',
    } satisfies CustomPaletteColorOptions,
    background: {
      default: '#fafafa', // Clean, bright background
      paper: 'rgba(255, 255, 255, 0.95)', // Premium glass effect
    },
    text: {
      primary: '#263238', // Deep charcoal for excellent readability
      secondary: '#455a64', // Sophisticated gray-blue
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 12px 40px rgba(21, 101, 192, 0.08)',
          borderRadius: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(21, 101, 192, 0.05), transparent 50%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow:
              '0 16px 48px rgba(21, 101, 192, 0.12), 0 0 30px rgba(21, 101, 192, 0.1)',
            '&::before': {
              opacity: 1,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(21, 101, 192, 0.15)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(21, 101, 192, 0.25)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #1565c0, #1976d2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
          },
        },
        outlined: {
          borderColor: 'rgba(21, 101, 192, 0.3)',
          color: '#1565c0',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: -'100%',
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(90deg, transparent, rgba(21, 101, 192, 0.1), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
          '&:hover': {
            borderColor: '#1565c0',
            boxShadow:
              '0 0 20px rgba(21, 101, 192, 0.3), 0 0 40px rgba(21, 101, 192, 0.2)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
              boxShadow: '0 0 0 3px rgba(21, 101, 192, 0.1)',
            },
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      fontWeight: 500,
    },
  },
}

// Enhanced dark mode oceanic theme with sophisticated colors
export const oceanicThemeDarkTokens: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#42a5f5', // Refined blue for dark mode
      light: '#90caf9',
      dark: '#1976d2',
      contrastText: '#ffffff',
      gradient:
        'linear-gradient(135deg, rgba(66, 165, 245, 0.9), rgba(100, 181, 246, 0.8), rgba(144, 202, 249, 0.7))',
    } satisfies CustomPaletteColorOptions,
    secondary: {
      main: '#26a69a', // Sophisticated teal
      light: '#4db6ac',
      dark: '#00897b',
      contrastText: '#ffffff',
      gradient:
        'linear-gradient(135deg, rgba(38, 166, 154, 0.9), rgba(77, 182, 172, 0.8), rgba(128, 203, 196, 0.7))',
    } satisfies CustomPaletteColorOptions,
    highlight: {
      main: '#66bb6a', // Elegant green
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#ffffff',
      gradient:
        'linear-gradient(135deg, rgba(102, 187, 106, 0.9), rgba(129, 199, 132, 0.8), rgba(165, 214, 167, 0.7))',
    } satisfies CustomPaletteColorOptions,
    background: {
      default: '#0d1117', // Deep, sophisticated dark
      paper: 'rgba(22, 27, 34, 0.95)', // Premium dark glass effect
    },
    text: {
      primary: '#f0f6fc', // Crisp white for excellent contrast
      secondary: '#8b949e', // Refined gray
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(22, 27, 34, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
          borderRadius: '16px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(66, 165, 245, 0.1), transparent 50%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow:
              '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 30px rgba(66, 165, 245, 0.2)',
            '&::before': {
              opacity: 1,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 12px rgba(66, 165, 245, 0.25)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(66, 165, 245, 0.35)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #42a5f5, #1976d2)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1976d2, #1565c0)',
          },
        },
        outlined: {
          borderColor: 'rgba(66, 165, 245, 0.4)',
          color: '#42a5f5',
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
              'linear-gradient(90deg, transparent, rgba(66, 165, 245, 0.15), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
          '&:hover': {
            borderColor: '#42a5f5',
            boxShadow:
              '0 0 25px rgba(66, 165, 245, 0.4), 0 0 50px rgba(66, 165, 245, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 0 3px rgba(66, 165, 245, 0.2)',
            },
          },
        },
      },
    },
  },
}
