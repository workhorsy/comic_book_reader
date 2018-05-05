import { h, Component } from 'preact'
import style from './style'

const Spinner = () => <div className={style.spinner} />

class Loader extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {}

  render() {
    const { isLoading } = this.props

    return (
      <div className={style.overlay + ' ' + (isLoading ? '' : style.hide)}>
        <Spinner />
      </div>
    )
  }
}

export default Loader
