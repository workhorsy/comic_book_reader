import { h, Component } from 'preact'
import style from './style'

class Loader extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {}

  render() {
    return <div className={style.loader} />
  }
}

export default Loader
