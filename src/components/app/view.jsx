import { h, Component } from 'preact'
import { Router, route } from 'preact-router'
import { requireBrowserFeatures } from '../../utils/browser'
import createHashHistory from 'history/createHashHistory'

// Routes
import Welcome from '../../routes/welcome'
import Viewer from '../../routes/viewer'

// Errors
import Unsupported from '../../routes/unsupported'

// Components
import Menu from '../menu'
import style from './style'

export default class App extends Component {
  state = {
    currentRoute: null,
    compatible: true,
    hideMenu: false,
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    // Test settings
    console.log('Init settings:', this.props.settings)
    this.hasErrors()
  }

  /*
  shouldComponentUpdate(props, state) {
      return false
  }
  */

  hasErrors = () => {
    // Test browser features
    requireBrowserFeatures((errors, warnings) => {
      errors.length > 0 && this.setState({ compatible: false })
    })
  }

  handleRoute = page => {
    const { compatible } = this.state
    this.setState({ currentRoute: page, hideMenu: false })

    // Redirect to error
    !compatible && route('/unsupported')
    // Redirect to welcome page
    page.url === '/unsupported' && compatible && route('/')
  }

  render() {
    const { settings } = this.props

    return (
      <div id="app" class={`${style.app}`}>
        <Router onChange={this.handleRoute} history={createHashHistory()}>
          <Welcome path="/" default />
          <Viewer path="/reader" />
        </Router>
      </div>
    )
  }
}
