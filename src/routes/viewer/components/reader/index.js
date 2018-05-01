import { h, Component } from 'preact'
import OpenSeaDragon from 'openseadragon'
import style from './style'
import OSDConfig from './osd.config.js'
import Toolbar from '../toolbar'

export default class Reader extends Component {
  constructor(props) {
    super(props)
    this.viewer = null
    this.state = {
      currentMode: 'slides',
    }
  }

  getPages(pageNumber, renderMode) {
    const { bookMode, pages, totalPages, currentPage } = this.props.reader
    const pageIndex = pageNumber - 1
    const page = pages[pageIndex] || false

    // TODO: FIX BOOK MODE
    let isBookMode = bookMode

    if (renderMode) {
      isBookMode = renderMode === 'bookMode'
    }

    // Get next page to render / false on first page (cover) and last page
    const nextPage =
      pageIndex === 0 || pageNumber === pages.length
        ? null
        : pages[pageIndex + 1]

    return isBookMode && nextPage ? [page, nextPage] : page
  }

  getCurrentPage() {
    const { world } = this.viewer
    const { currentPage, pages } = this.props.reader
    return pages[currentPage]
  }

  getTargetZoom() {
    const { viewport, world } = this.viewer
    const page = world.getItemAt(0)
    const targetZoom = page
      ? page.source.dimensions.x / viewport.getContainerSize().x
      : 0.25
    return targetZoom
  }

  zoomToOriginalSize() {
    const targetZoom = this.getTargetZoom()
    this.viewer.viewport.zoomTo(targetZoom, null, true)
  }

  jumpToPage(index) {
    const { setCurrentPage } = this.props
    setCurrentPage(index)
    this.renderPage(index)
  }

  renderPage(index, mode = false) {
    const { currentPage } = this.props.reader
    const pages = this.getPages(index || currentPage, mode)
    pages && this.viewer.open(pages, 1)
  }

  renderBookModeLayout() {
    const { viewport, world } = this.viewer
    const margin = 8 / viewport.getContainerSize().x
    const pos = new OpenSeaDragon.Point(0, 0)
    const count = world.getItemCount()
    for (let i = 0; i < count; i++) {
      const tiledImage = world.getItemAt(i)

      if (tiledImage) {
        const bounds = tiledImage.getBounds()
        tiledImage.setPosition(pos, true)
        pos.x += bounds.width + margin
      }
    }

    this.fitPages(true)
  }

  fitPages(fast = false) {
    const { viewport, world } = this.viewer
    const count = world.getItemCount()
    const tiledImage = world.getItemAt(0)

    if (tiledImage) {
      const bounds = tiledImage.getBounds()
      const margin = 8 / viewport.getContainerSize().x
      bounds.width = (bounds.width + margin) * count
      viewport.fitBoundsWithConstraints(bounds, fast)
    }
  }

  handleBookMode() {
    const { toggleBookMode } = this.props
    toggleBookMode()
  }

  initOpenSeaDragon() {
    const { id, reader, showLoadingScreen } = this.props
    const { currentPage } = reader
    this.viewer = OpenSeaDragon({
      id,
      ...OSDConfig,
      tileSources: this.getPages(currentPage),
    })

    this.viewer.addHandler('open', () => {
      const { viewport, world } = this.viewer

      // Set Zoom options
      const targetZoom = this.getTargetZoom()
      viewport.maxZoomLevel = targetZoom

      // Render Book mode
      this.renderBookModeLayout()
      showLoadingScreen(false)
    })

    this.viewer.addHandler('close', () => {
      showLoadingScreen(true)
    })
  }

  componentShouldUpdate() {
    return false
  }

  // gets called when this route is navigated to
  componentDidMount() {
    // Initializa OSD instance
    this.initOpenSeaDragon()
  }

  componentWillReceiveProps(nextProps) {
    // Quick hack: (TODO) FIX IT!
    const { bookMode, currentPage } = this.props.reader
    const nextBookMode = nextProps.reader.bookMode
    if (bookMode != nextBookMode) {
      console.log('Update', nextBookMode)
      //this.setState({currentMode: bookMode ? "bookMode" : "slides"});
      this.renderPage(currentPage, nextBookMode ? 'bookMode' : 'slides')
    }
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const { id, reader } = this.props
    const { isLoading, currentPage, totalPages, bookMode } = reader
    return (
      <div>
        <Toolbar
          onFitPages={this.fitPages.bind(this)}
          totalPages={totalPages}
          currentPage={currentPage}
          bookMode={bookMode}
          onBookMode={e => this.handleBookMode(e)}
          onPageChange={this.jumpToPage.bind(this)}
        />
        <div id={id} className={style.viewer} />
      </div>
    )
  }
}
