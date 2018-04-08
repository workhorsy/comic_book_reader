import { h, render } from 'preact'
import { Provider } from 'unistore/preact'
import store from './unistore/store'
import App from './components/app'
import './style'

import fontawesome from '@fortawesome/fontawesome'

import brands from '@fortawesome/fontawesome-free-brands'
import solid from '@fortawesome/fontawesome-free-solid'

fontawesome.library.add(brands, solid)

render(
  <div id="outer">
    <Provider store={store}>
      <App />
    </Provider>
  </div>,
  document.body
)
