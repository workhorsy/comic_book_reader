import { h, Component } from 'preact'
import Icon from '../../../../components/icon'
import Button from '../../../../components/button'
import style from './style'

export default class ErrorMessage extends Component {
  constructor(props) {
    super(props)
  }

  // gets called when this route is navigated to
  componentDidMount() {}

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const { description, action } = this.props
    return (
      <div class={`${style.view}`}>
        <div class={style.icon} translatable="true">
          <Icon name={'exclamation-triangle'} />
        </div>
        <p class={style.description} translatable="true">
          {description || 'Unable to load image file.'}
        </p>
        <div class={style.actions}>
          <Button onClick={action}>Skip Page</Button>
        </div>
      </div>
    )
  }
}
