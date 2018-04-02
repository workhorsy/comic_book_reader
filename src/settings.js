export const defaultSettings = {
  theme: {
    type: 'select',
    values: ['dark', 'light'],
    defaultValue: 'theme',
    label: 'Select a theme',
  },
  install_updates_enabled: {
    type: 'checkbox',
    defaultValue: false,
    label: 'Check for updates',
  },

  right_click_enabled: {
    type: 'checkbox',
    defaultValue: false,
    label: 'Allow right click',
  },
  use_higher_quality_previews: {
    type: 'checkbox',
    defaultValue: false,
    label: 'Use higher quality page previews',
  },
  use_smoothing_when_resizing_images: {
    type: 'checkbox',
    defaultValue: false,
    label: 'Use smoothing when resizing images',
  }
}

export function getDefaultSettings() {
  const settings = {}
  Object.entries(defaultSettings).forEach(([key, value]) => {
    settings[key] = value.defaultValue
  })
  return settings
}

export function getSettings() {
  let settings = {}
  try {
    const stored = JSON.parse(localStorage.getItem('settings'))
    settings = stored ? stored : getDefaultSettings()
  } catch (error) {
    // Default settings
    settings = getDefaultSettings()
    throw new Error('Settings failed to load!')
  } finally {
    return settings
  }
}

export function updateSettings(settings) {
  try {
    const data = JSON.stringify(settings)
    data && localStorage.setItem('settings', data)
  } catch (error) {
    throw new Error("Settings: Can't load Settings, revert to default! ")
  }
}
