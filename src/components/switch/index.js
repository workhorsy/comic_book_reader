import { h, Component } from 'preact'
import style from './style'

export default class Switch extends Component {
  state = {
    checked: this.props.checked || false,
  }

  handleInputChange = event => {
    const { onChange } = this.props
    const { checked } = event.target
    onChange && onChange(checked)
    console.log(checked)
    this.setState({ checked })
  }

  render() {
    let { props, state } = this
    return (
      <label class={style.switch}>
        <input type="checkbox" onChange={this.handleInputChange} checked={state.checked} />
        <span class={style.slider} />
        <span class={style.label}>{props.label}</span>
      </label>
    )
  }
}
