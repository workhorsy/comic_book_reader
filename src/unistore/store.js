import { createStore, connect } from 'unistore/full/preact'
import { settingsGetAll } from '../settings.js';

// Set initialState
const initialState = { count: 0 };

// Load settings
initialState.settings = settingsGetAll();

// Create store
export default createStore(initialState);
