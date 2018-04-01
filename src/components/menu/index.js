import { h, Component } from 'preact'
import { Link } from 'preact-router/match'
import { connect } from 'preact-redux'
import { bindActions } from '../../util'
import reduce from '../../reducers'
import style from './style'
import * as actions from '../../actions'
import Icon from '../../components/icon'

const Item = ({ id, label, icon, href, onClick }) => {
  const action = event => onClick && onClick(event)
  return (
      <Link id={id} class={style.item} activeClassName={style.active} href={href}>
        {icon && <Icon name={icon} />}
        <span class={style.label}>{label}</span>
      </Link>
  )
}

const Slider = props => {
  return (
    <div class={`${style.slider} ${props.open ? style.open : ''}`}>
      <div class={style.links}>
        <Item icon="folder" label="Files" href="/files" />
        <Item icon="bookmark" label="Library" href="/library" />
        <Item icon="question-circle" label="About" href="/" />
        <Item icon="cog" label="Settings" href="/settings" />
      </div>
    </div>
  )
}

// Internal button
const Button = ({ label, icon, onClick }) => {
  const action = event => onClick && onClick(event)
  return (
    <button class={style.button} title={label} onClick={action}>
      {icon && <Icon name={icon} />}
      <div class={style.line}>{label}</div>
    </button>
  )
}

//Test data for ComicLibrary ( remove this )
const TestData = {
  items: [
    { title: 'Issue #1', cover: './assets/undefined.png' },
    { title: 'Issue #2', cover: './assets/undefined.png' },
    { title: 'Issue #3', cover: './assets/undefined.png' },
    { title: 'Issue #4', cover: './assets/undefined.png' },
    { title: 'Issue #5', cover: './assets/undefined.png' },
  ],
}

@connect(reduce, bindActions(actions))
export default class Menu extends Component {
  state = {
    openSlider: false,
  }

  onBtnFullScreen = () => {
    toggleFullScreen()
  }

  toggleSlider = () => {
    this.setState(prevState => ({ openSlider: !prevState.openSlider }))
  }

  closeSlider = () => {
    this.setState({ openSlider: false })
  }

  render() {
    let { props, state } = this
    return (
      <nav class={style.comic_menu}>
        <Item id={style.appName} label={'CBR'} href={'/'} />
        <Slider open={state.openSlider} />
        {state.openSlider && <div class={style.overlay} onClick={this.closeSlider} />}
        <Button id="btnFileLoad" onClick={this.toggleSlider} icon={'bars'} />
      </nav>
    )
  }
}
