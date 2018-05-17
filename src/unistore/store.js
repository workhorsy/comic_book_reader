import { createStore, connect } from 'unistore/full/preact'
import { getSettings } from '../settings.js'
import readerDefaultState from './states/reader.js'

// Set initialState
const initialState = {}

// Load settings
initialState.settings = getSettings()

// Load reader
initialState.reader = readerDefaultState

// Create store
export default createStore(initialState)
