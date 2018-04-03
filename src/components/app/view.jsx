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
import style from './style'

export default class App extends Component {
  state = {
    currentRoute: null,
    compatible: true,
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    // Test settings
    console.log('Init settings:', this.props.settings)
    this.hasErrors()
  }

  shouldComponentUpdate(props, state) {
    if (props.settings.night_mode_enabled !== this.props.settings.night_mode_enabled) {
      // Update theme
      return true
    }
    return false
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
    const { settings } = this.props

    // Select theme
    const theme = settings.night_mode_enabled ? style.themeDark : style.themeLight

    return (
      <div id="app" class={`${style.app} ${theme}`}>
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
