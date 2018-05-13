import { h, Component } from 'preact'
import style from './style'

import Icon from '../../components/icon'

export default class Button extends Component {
  handleClick = event => {
    this.props.onClick && this.props.onClick(event)
  }

  render() {
    const { props, state } = this
    const type = props.type ? style[props.type] : ''
    return (
      <button
        class={`${style.comic_button} ${type}`}
        onClick={this.handleClick}
      >
        {' '}
        {props.icon ? <Icon name={props.icon} /> : null}
        {props.children.length > 0 && props.children[0]}
      </button>
    )
  }
}
