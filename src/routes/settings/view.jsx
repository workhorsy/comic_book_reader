import { h, Component } from 'preact'
import style from './style'
import Button from '../../components/button'
import CheckBox from '../../components/checkbox'
import Switch from '../../components/switch'
import { defaultSettings, updateSettings, getDefaultSettings } from '../../settings.js'
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
    settings && updateSettings(settings)
  }

  setSetting = (key, value) => {
    const { setSettings } = this.props
    setSettings({ key, value })
  }

  render() {
    const { settings } = this.props

    const checkboxes = Object.entries(defaultSettings).filter(
      ([item, data]) => data.type === 'checkbox'
    )

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
          {checkboxes.map(([item, data]) => (
            <p>
              <CheckBox
                key={item}
                checked={settings[item]}
                onChange={value => this.setSetting(item, value)}
              >
                {data.label}
              </CheckBox>
            </p>
          ))}
          <hr />
          <Switch
            checked={settings['night_mode_enabled']}
            label={'Night Mode'}
            onChange={value => this.setSetting('night_mode_enabled', value)}
          />
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
        </div>
      </div>
    )
  }
}
