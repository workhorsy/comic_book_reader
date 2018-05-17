// Immutable state: quick hack [FIX IT]
const deepClone = state => JSON.parse(JSON.stringify(state))

const actions = store => ({
  // for count
  setSettings(prevState, { key, value }) {
    const state = deepClone(prevState)
    const { settings } = state
    if (settings[key] !== undefined) settings[key] = value
    return {
      ...state,
      settings: { ...settings },
    }
  },
})

export default actions
