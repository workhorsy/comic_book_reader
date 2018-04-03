import { createStore, connect } from 'unistore/full/preact'
import { getSettings } from '../settings.js'

// Set initialState
const initialState = {}

// Load settings
initialState.settings = getSettings()

// Create store
export default createStore(initialState)
