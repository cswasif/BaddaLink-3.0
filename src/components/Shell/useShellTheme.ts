import { useMemo } from 'react'
import { createTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'
import { SettingsContext } from 'contexts/SettingsContext'
import { ColorMode } from 'models/settings'
import { oceanicThemeTokens, oceanicThemeDarkTokens } from 'styles/purpleTheme'
import { useContext } from 'react'

export const useShellTheme = () => {
  const { getUserSettings } = useContext(SettingsContext)
  const { colorMode } = getUserSettings()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return useMemo(() => {
    if (colorMode === ColorMode.OCEANIC) {
      return createTheme(
        prefersDarkMode ? oceanicThemeDarkTokens : oceanicThemeTokens
      )
    }
    return createTheme({
      palette: {
        mode: colorMode === ColorMode.DARK ? 'dark' : 'light',
      },
    })
  }, [colorMode, prefersDarkMode])
}
