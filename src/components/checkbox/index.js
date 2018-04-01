import { h, Component } from 'preact'
import style from './style'

export default class ComicCheckBox extends Component {
  state = {}

  componentDidMount() {}

  render() {
    let { props, state } = this
    return (
        <label for={props.id} class={style.checkbox}>
            <input id={props.id} type="checkbox" />
            <span class={style.label}>{props.children && props.children[0]}</span>
            <span class={style.mark}></span>
        </label>
    )
  }
}
