import { h, Component } from 'preact'
//import { Link } from 'preact-router/match';
import style from './style'

import ComicButton from '../comic-button'
import ComicCheckBox from '../comic-check-box'

export default class ComicSettings extends Component {
  render() {
    return (
      <div class={style.comic_settings}>
        <div id={style.settingsMenu} />
      </div>
    )
  }
}
