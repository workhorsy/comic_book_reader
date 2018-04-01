import { h, Component } from 'preact'
import style from './style'

export default class ComicCheckBox extends Component {
  state = {
    checked: this.props.checked || false,
  }

  componentDidMount() {}

  handleInputChange = event => {
    const { onChange } = this.props
    const { checked } = event.target
    onChange && onChange(checked)
    this.setState({ checked })
  }

  render() {
    let { props, state } = this
    return (
      <label for={props.id} class={style.checkbox}>
        <input
          id={props.id}
          type="checkbox"
          onChange={this.handleInputChange}
          checked={state.checked}
        />
        <span class={style.label}>{props.children && props.children[0]}</span>
        <span class={style.mark} />
      </label>
    )
  }
}
