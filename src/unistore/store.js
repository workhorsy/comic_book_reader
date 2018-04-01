import { createStore, connect } from 'unistore/full/preact'
import { defaultSettings } from '../settings.js'

// Set initialState
const initialState = { count: 0 }

const storedSettings = localStorage.getItem('settings')

// Load settings
initialState.settings = (storedSettings && JSON.parse(storedSettings)) || defaultSettings

// Create store
export default createStore(initialState)
