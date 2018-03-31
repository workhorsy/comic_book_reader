import { h, Component } from 'preact'
import style from './style'
import Button from '../../components/button'
import ComicCheckBox from '../../components/comic-check-box'

import { route } from 'preact-router'

export default class Settings extends Component {
  state = {}

  // gets called when this route is navigated to
  componentDidMount() {}

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    return (
      <div class={style.view}>
        <div class="settings">
          <h1>Settings</h1>
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
          <hr />
          <p>
            <ComicCheckBox id="btnDisableRightClick">Allow right click</ComicCheckBox>
          </p>
          <p>
            <ComicCheckBox id="btnEnableInstallUpdates">Check for updates</ComicCheckBox>
          </p>
          <p>
            <ComicCheckBox id="btnUseHigherQualityPreviews">
              Use higher quality page previews
            </ComicCheckBox>
          </p>
          <p>
            <ComicCheckBox id="btnUseSmoothingWhenResizingImages">
              Use smoothing when resizing images
            </ComicCheckBox>
          </p>
          <hr />
          <p>
            <label>Storage used:</label>
            <span id="totalDBSize" style="margin: 4px;">
              . . .
            </span>
          </p>
          <p>
            <Button id="btnClearAllData">Clear all data</Button>
          </p>
          <hr />
          <p>
            <label>Software Version:</label>
            <span id="versionDate" style="margin: 4px;">
              ...
            </span>
          </p>
          <p>
            <Button id="btnCheckForUpdatesNow" style="display: none;">
              Check for updates now
            </Button>
          </p>
          <p>
            <Button id="btnHomepage">Visit home page at github</Button>
          </p>
        </div>
      </div>
    )
  }
}
