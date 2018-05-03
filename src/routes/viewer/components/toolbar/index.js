import { h, Component } from 'preact'
import Icon from '../../../../components/icon'
import style from './style'

const Progress = ({ current, total }) => {
  const loaded = Math.round(current / total * 100)
  const progress = Math.round(loaded / 10) * 10
  console.log(progress)

  return (
    <div className={[style.bar, loaded === 100 ? style.hide : ''].join(' ')}>
      <div className={style.progress} style={{ width: progress + '%' }} />
    </div>
  )
}

class PageNav extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isFirstPage: true,
      isLastPage: false,
    }
  }

  nextPage() {
    const { onPageChange, totalPages, currentPage } = this.props
    const nextPage = currentPage + 1
    const isLastPage = currentPage === totalPages || nextPage === totalPages
    const selectPage = isLastPage ? totalPages : nextPage
    onPageChange(selectPage)
    this.setState({ isLastPage, isFirstPage: false })
  }

  previousPage() {
    const { onPageChange, totalPages, currentPage } = this.props
    const prevPage = currentPage - 1
    const isFirstPage = currentPage === 1 || prevPage === 1 || currentPage === 0
    const selectPage = isFirstPage ? 1 : prevPage
    onPageChange(selectPage)
    this.setState({ isFirstPage, isLastPage: false })
  }

  componentWillUpdate(nexProps) {
    const { currentPage, totalPages } = this.props
    if (totalPages != nexProps.totalPages) {
      this.setState({
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === totalPages,
      })
    }
  }

  componentDidMount() {
    const { currentPage, totalPages } = this.props
    this.setState({
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    })
  }

  render() {
    const { currentPage, totalPages } = this.props
    const { isFirstPage, isLastPage } = this.state

    return (
      <div className={style.nav}>
        <div
          className={style.item}
          onClick={this.previousPage.bind(this)}
          disabled={isFirstPage}
          title={'Previous page'}
        >
          <Icon name={'angle-left'} />
        </div>
        <div className={style.item}>
          <div className={style.label}>
            {currentPage} <span> / {totalPages}</span>
          </div>
        </div>
        <div
          className={style.item}
          onClick={this.nextPage.bind(this)}
          disabled={isLastPage}
          title={'Next page'}
        >
          <Icon name={'angle-right'} />
        </div>
      </div>
    )
  }
}

class ToolbarAction extends Component {
  constructor(props) {
    super(props)
    this.state = {
      active: this.props.active || false,
    }
  }

  handleClick() {
    const { onAction, toggle } = this.props
    this.setState(prevState => {
      const { active } = prevState
      onAction && onAction(!active)
      return {
        active: toggle ? !active : false,
      }
    })
  }

  render() {
    const { title, icon } = this.props
    const { active } = this.state
    return (
      <div
        className={[style['toolbar-action'], active ? style.active : ''].join(
          ' '
        )}
        onClick={this.handleClick.bind(this)}
        title={title}
      >
        <Icon name={icon} />
      </div>
    )
  }
}

export default class Toolbar extends Component {
  constructor(props) {
    super(props)
  }

  // gets called when this route is navigated to
  componentDidMount() {}

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const {
      onPageChange,
      totalPages,
      onBookMode,
      onFitPages,
      currentPage,
      loadedPages,
      bookMode,
    } = this.props

    const actions = [
      {
        icon: 'expand',
        title: 'Fit All',
        toggle: false,
        onAction: e => {
          onFitPages()
        },
      },
      {
        icon: 'columns',
        title: 'Book Mode',
        toggle: true,
        active: bookMode,
        onAction: e => {
          onBookMode(e)
        },
      },
      {
        icon: 'arrows-alt',
        title: 'Drag Tool',
        toggle: true,
        active: true,
        onAction: e => {},
      },
    ]

    return (
      <div className={style.toolbar}>
        <PageNav
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
        <div className={style['toolbar-actions']}>
          {actions.map((actionProps, i) => (
            <ToolbarAction key={i} {...actionProps} />
          ))}
        </div>

        <Progress current={loadedPages} total={totalPages} />
      </div>
    )
  }
}
