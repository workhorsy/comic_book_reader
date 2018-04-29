import { h, Component } from 'preact'
import Icon from '../../../../components/icon'
import style from './style'

// Test

class PageNav extends Component {
  constructor(props) {
    super(props)
    this.state = {
      currentPage: 1,
      isFirstPage: true,
      isLastPage: false,
      totalPages: this.props.totalPages,
    }
  }

  nextPage() {
    const { onPageChange } = this.props
    this.setState(prevState => {
      const { currentPage, totalPages } = prevState
      const nextPage = currentPage + 1
      if (nextPage < prevState.totalPages) {
        onPageChange(nextPage)
        // Go to next page
        return { isFirstPage: false, currentPage: nextPage }
      } else {
        // Go to last page
        onPageChange(totalPages)
        return { isLastPage: true, currentPage: totalPages }
      }
    })
  }

  previousPage() {
    const { onPageChange } = this.props
    this.setState(prevState => {
      const prevPage = prevState.currentPage - 1
      if (prevPage > 1) {
        onPageChange(prevPage)
        // Go to previous page
        return { isFirstPage: false, isLastPage: false, currentPage: prevPage }
      } else {
        onPageChange(1)
        // Go to First page (Book cover)
        return { isFirstPage: true, currentPage: 1 }
      }
    })
  }

  render() {
    const { currentPage, isFirstPage, isLastPage, totalPages } = this.state
    return (
      <div className={style.nav}>
        <div
          className={style.item}
          onClick={this.previousPage.bind(this)}
          disabled={isFirstPage}
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
    const { onClick, toggle } = this.props
    this.setState(prevState => {
      const { active } = prevState
      onClick && onClick(!active)
      return { active: toggle ? !active : false }
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
    const { onPageChange, totalPages, onBookMode, onFitPages } = this.props

    const actions = [
      {
        icon: 'expand',
        title: 'Fit All',
        toggle: false,
        onClick: e => {
          onFitPages()
        },
      },
      {
        icon: 'columns',
        title: 'Book Mode',
        toggle: true,
        onClick: onBookMode,
      },
      {
        icon: 'arrows-alt',
        title: 'Drag Tool',
        toggle: true,
        onClick: e => {},
      },
    ]

    return (
      <div className={style.toolbar}>
        <PageNav totalPages={totalPages} onPageChange={onPageChange} />
        <div className={style['toolbar-actions']}>
          {actions.map((actionProps, i) => (
            <ToolbarAction key={i} {...actionProps} />
          ))}
        </div>
      </div>
    )
  }
}
