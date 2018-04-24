import { h, Component } from 'preact'
import { Link } from 'preact-router/match'
import style from './style'
import Icon from '../../components/icon'

const Item = ({ id, label, icon, href, onClick }) => {
  const action = event => onClick && onClick(event)
  return (
    <Link
      id={id}
      class={style.item}
      activeClassName={style.active}
      href={href}
      onClick={action}
    >
      {icon && <Icon name={icon} />}
      <span class={style.label}>{label}</span>
    </Link>
  )
}

const Slider = ({ closeSlider, open }) => {
  return (
    <div class={`${style.slider} ${open ? style.open : ''}`}>
      <div class={style.items}>
        <Item icon="folder" label="Files" href="/files" onClick={closeSlider} />
        <Item
          icon="bookmark"
          label="Library"
          href="/library"
          onClick={closeSlider}
        />
        <Item
          icon="question-circle"
          label="About"
          href="/"
          onClick={closeSlider}
        />
        <hr />
        <Item
          icon="cog"
          label="Settings"
          href="/settings"
          onClick={closeSlider}
        />
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

  hideSlider = () => {
    // Fast
    this.setState({ openSlider: false })
  }

  closeSlider = () => {
    // Wait
    setTimeout(() => {
      //this.setState({ openSlider: false })
    }, 250)
  }

  render() {
    let { props, state } = this
    return (
      <nav class={style.comic_menu}>
        <Button onClick={this.toggleSlider} icon={'bars'} />
        <Item id={style.appName} label={'CBR'} href={'/'} />
        {
          <div
            class={style.overlay}
            style={state.openSlider && { height: '100vh', opacity: 0 }}
            onClick={this.hideSlider}
          />
        }
        <Slider open={state.openSlider} closeSlider={this.closeSlider} />
      </nav>
    )
  }
}
