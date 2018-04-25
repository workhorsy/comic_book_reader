import { h, Component } from 'preact'
import Icon from '../../../../components/icon'
import style from './style'

// Test

export default class Toolbar extends Component {
  constructor(props) {
    super(props)
  }

  // gets called when this route is navigated to
  componentDidMount() {}

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    return (
      <div className={style.toolbar}>
        <div className={style.item}>
          <Icon name={'angle-left'} />
        </div>
        <div className={style.item}>
          <span className={style.label}>1</span>
        </div>
        <div className={style.item}>
          <Icon name={'angle-right'} />
        </div>
      </div>
    )
  }
}
