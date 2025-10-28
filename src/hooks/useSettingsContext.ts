import { useContext } from 'react'
import { SettingsContext } from 'contexts/SettingsContext'

export const useSettingsContext = () => {
  const { getUserSettings } = useContext(SettingsContext)
  return getUserSettings()
}
