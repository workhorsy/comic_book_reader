import { h, Component } from 'preact'
import { Link } from 'preact-router'
import EmptyState from '../../components/empty-state'
import style from './style'

class Item extends Component {
  static defaultProps = {
    cover: './assets/invalid_image.png',
  }

  state = {
    cover: this.props.cover,
    loaded: false,
  }

  componentDidUpdate() {
    //this.state.loaded && console.log("Loaded!");
  }

  handleImageLoaded() {
    this.setState({ loaded: true })
  }

  handleError(err) {
    this.setState({ cover: './assets/invalid_image.png' })
  }

  render() {
    let { props, state } = this
    return (
      <div class={style.item}>
        <img
          class={style.comicPreview}
          src={state.cover}
          onLoad={this.handleImageLoaded.bind(this)}
          onError={this.handleError.bind(this)}
        />
        <p>{props.title}</p>
      </div>
    )
  }
}

export default class Library extends Component {
  static defaultProps = {
    items: [],
  }
  render() {
    const { items } = this.props

    const EmptyMessage = props => (
      <span>
        {' '}
        Your library is empty, <Link href="/file">add</Link> some files first.{' '}
      </span>
    )

    return (
      <div id="libraryMenu" class={style.view}>
        {items && items.length ? (
          items.map((i, k) => <Item key={k} {...i} />)
        ) : (
          <EmptyState icon="bookmark" title="No comics yet" message={EmptyMessage} />
        )}
      </div>
    )
  }
}
