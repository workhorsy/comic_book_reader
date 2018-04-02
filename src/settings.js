export const defaultSettings = {
  theme: {
    type: 'select',
    values: ['dark', 'light'],
    defaultValue: 'dark',
    label: 'Select a theme',
  },
  install_updates_enabled: {
    type: 'checkbox',
    defaultValue: false,
    label: 'Check for updates',
  },
  night_mode_enabled: {
    type: 'switch',
    defaultValue: true,
    label: 'Night Mode',
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
  },
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
    settings = JSON.parse(localStorage.getItem('settings'))
  } catch (error) {
    throw new Error('Settings failed to load!')
  } finally {
    return Object.assign(getDefaultSettings(), settings)
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
