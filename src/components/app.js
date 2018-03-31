import { h, Component } from 'preact'
import { Router } from 'preact-router'

import File from '../routes/file'
import Welcome from '../routes/welcome'
import Library from '../routes/library'
import Settings from '../routes/settings'

import Menu from './menu'

export default class App extends Component {
  handleRoute = e => {
    this.currentUrl = e.url
  }

  render() {
    return (
      <div id="app">
        <Menu />
        <Router onChange={this.handleRoute}>
          <Welcome path="/" />
          <File path="/file" />
          <Library path="/library" />
          <Settings path="/settings" />
        </Router>
      </div>
    )
  }
}
