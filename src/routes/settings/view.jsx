import { h, Component } from 'preact'
import style from './style'
import Button from '../../components/button'
import CheckBox from '../../components/checkbox'

import { route } from 'preact-router'

export default class Settings extends Component {
  state = {}

  // gets called when this route is navigated to
  componentDidMount() {
    window.addEventListener('beforeunload', this.storeSettings)
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {
    this.storeSettings()
    window.removeEventListener('beforeunload', () => {
      this.storeSettings()
    })
  }

  storeSettings = () => {
    // Save settings to localStorage (persistent data)
    const { settings } = this.props
    console.log(settings)
    localStorage.setItem('settings', JSON.stringify(settings))
  }

  updateSettings = (key, value) => {
    const { setSettings } = this.props
    setSettings({ key, value })
  }

  render() {
    const { settings } = this.props
    return (
      <div class={style.view}>
        <div class="settings">
          <h1>Settings</h1>
          {/*
          <p>
            <label>Language: </label>
            <select id="btnSelectLanguage">
              <option value="en">English</option>
              <option value="ar">Arabic (عربى)</option>
              <option value="zh">Chinese (中文)</option>
              <option value="fr">French (français)</option>
              <option value="de">German (Deutsche)</option>
              <option value="ja">Japanese (日本語)</option>
              <option value="pt">Portuguese (Português)</option>
              <option value="ru">Russian (русский)</option>
              <option value="es">Spanish (Español)</option>
            </select>
          </p>
          */}
          <hr />
          <p>
            <CheckBox
              id="btnDisableRightClick"
              checked={settings.right_click_enabled}
              onChange={value => this.updateSettings('right_click_enabled', value)}
            >
              Allow right click
            </CheckBox>
          </p>
          <p>
            <CheckBox id="btnEnableInstallUpdates">Check for updates</CheckBox>
          </p>
          <p>
            <CheckBox id="btnUseHigherQualityPreviews">Use higher quality page previews</CheckBox>
          </p>
          <p>
            <CheckBox id="btnUseSmoothingWhenResizingImages">
              Use smoothing when resizing images
            </CheckBox>
          </p>
          <hr />
          <p>
            <label>Storage used:</label>
            <span id="totalDBSize" style="margin: 4px;">
              0
            </span>
          </p>
          <Button id="btnClearAllData" type="secondary">
            Clear all data
          </Button>
          <hr />
          <p>
            <label>Software Version:</label>
            <span id="versionDate" style="margin: 4px;">
              0.0.1
            </span>
          </p>
        </div>
      </div>
    )
  }
}
