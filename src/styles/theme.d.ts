import '@mui/material/styles'
import { PaletteColorOptions, PaletteColor } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface CustomPaletteColor extends PaletteColor {
    gradient?: string
  }

  interface CustomPaletteColorOptions
    extends Omit<PaletteColorOptions, 'main'> {
    gradient?: string
    main: string
    light?: string
    dark?: string
    contrastText?: string
  }

  interface TypeBackground {
    gradient?: string
  }

  interface Palette {
    highlight?: CustomPaletteColor
  }

  interface PaletteOptions {
    highlight?: CustomPaletteColorOptions
  }

  interface SimplePaletteColorOptions {
    gradient?: string
  }
}
