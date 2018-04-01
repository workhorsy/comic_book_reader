import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { requireBrowserFeatures } from '../../utils/browser'

// Routes
import Files from '../../routes/files'
import Welcome from '../../routes/welcome'
import Library from '../../routes/library'
import Settings from '../../routes/settings'

// Errors
import Unsupported from '../../routes/unsupported'

// Components
import Menu from '../menu'

export default class App extends Component {
  state = {
    currentRoute: null,
    compatible: true,
  }

  componentDidMount() {
    // Test settings
    console.log('Init settings:', this.props.settings)
    this.hasErrors()
  }

  hasErrors = () => {
    // Test browser features
    requireBrowserFeatures((errors, warnings) => {
      errors.length > 0 && this.setState({ compatible: false })
    })
  }

  handleRoute = page => {
    const { compatible } = this.state
    this.setState({ currentRoute: page })
    // Redirect to error
    !compatible && route('/unsupported')
    // Redirect to welcome page
    page.url === '/unsupported' && compatible && route('/')
  }

  render() {
    return (
      <div id="app">
        {this.state.compatible && <Menu />}
        <Router onChange={this.handleRoute}>
          <Welcome path="/" default />
          <Files path="/files" />
          <Library path="/library" />
          <Settings path="/settings" />
          <Unsupported path="/unsupported" />
        </Router>
      </div>
    )
  }
}
