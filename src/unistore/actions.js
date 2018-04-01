const actions = store => ({
  // for count
  setSettings(prevState, { key, value }) {
    const { settings } = prevState
    if (settings[key] !== undefined) settings[key] = value
    return { ...prevState, settings }
  },
})

export default actions
