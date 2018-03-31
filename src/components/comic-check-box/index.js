import { h, Component } from 'preact'
import style from './style'

export default class ComicCheckBox extends Component {
  state = {}

  componentDidMount() {}

  render() {
    let { props, state } = this
    return (
      <div class={style.comic_check_box}>
        <input id={props.id} type="checkbox" />
        <label for={props.id}>{props.children.length > 0 && props.children[0]}</label>
      </div>
    )
  }
}
