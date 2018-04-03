import { h, Component } from 'preact'
import style from './style'

import Icon from '../../components/icon'

export default class Button extends Component {
  state = {}

  handleMouseUp = event => {
    //console.log(this.props.children[0]);
    this.props.onClick && this.props.onClick(event)
  }

  componentDidMount() {
    //console.log(this.props.text);
  }

  render() {
    const { props, state } = this
    const type = props.type ? style[props.type] : ''
    return (
      <button class={`${style.comic_button} ${type}`} onMouseUp={this.handleMouseUp}>
        {' '}
        {props.icon ? <Icon name={props.icon} /> : null}
        {props.children.length > 0 && props.children[0]}
      </button>
    )
  }
}
