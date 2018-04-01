import { h, render } from 'preact'
import { Provider } from 'unistore/preact'
import store from './unistore/store'
import App from './components/app'
import './style'

render(
  <div id="outer">
    <Provider store={store}>
      <App />
    </Provider>
  </div>,
  document.body
)
