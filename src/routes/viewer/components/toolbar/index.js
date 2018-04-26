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
        totalPages: 100,
    }
  }

  nextPage() {
      this.setState((prevState) => {
          const {currentPage, totalPages} = prevState;
          const nextPage = currentPage + 1;
          if(nextPage < prevState.totalPages) {
              // Go to next page
              return { isFirstPage: false, currentPage: nextPage }
          } else {
              // Go to last page
             return {isLastPage: true, currentPage: totalPages}
          }
      })
  }

  previousPage() {
          this.setState((prevState) => {
              const prevPage = prevState.currentPage - 1;
              if (prevPage > 1) {
                  // Go to previous page
                  return { isFirstPage: false, currentPage: prevPage}
              } else {
                  // Go to First page (Book cover)
                 return {isFirstPage: true, currentPage: 1}
              }
          })
  }

  render() {
    const {currentPage, isFirstPage, isLastPage, totalPages} = this.state;
    return (
      <div className={style.nav}>
        <div className={style.item} onClick={this.previousPage.bind(this)} disabled={isFirstPage}>
          <Icon name={'angle-left'} />
        </div>
        <div className={style.item}>
          <div className={style.label}>{currentPage} - {totalPages}</div>
        </div>
        <div className={style.item} onClick={this.nextPage.bind(this)} disabled={isLastPage}>
          <Icon name={'angle-right'} />
        </div>
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
    return (
      <div className={style.toolbar}>
        <PageNav />
      </div>
    )
  }
}
