const actions = store => ({
  // for count
  setSettings(prevState, data) {
    const { settings } = prevState
    settings[data.key] = data.value
    console.log({ ...prevState, settings })
    return { ...prevState, settings }
  },
})

export default actions
