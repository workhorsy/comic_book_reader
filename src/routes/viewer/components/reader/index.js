import { h, Component } from 'preact'
import OpenSeaDragon from 'openseadragon'
import style from './style'
import OSDConfig from './osd.config.js'
import Toolbar from '../toolbar'

// Test
// https://bookofbadarguments.com

const pages = [
  {
    type: 'image',
    url: 'https://bookofbadarguments.com/images/1.jpg',
    buildPyramid: false,
  },
  {
    type: 'image',
    url: 'https://bookofbadarguments.com/images/appeal_to_consequences.png',
    buildPyramid: false,
  },
  {
    type: 'image',
    url: 'https://bookofbadarguments.com/images/irrelevant_authority.png',
    buildPyramid: false,
  },
  {
    type: 'image',
    url: 'https://bookofbadarguments.com/images/strawman.png',
    buildPyramid: false,
  },
]

export default class Reader extends Component {
  constructor(props) {
    super(props)
    this.viewer = null
    this.state = {
      currentPage: 4,
      bookMode: false,
      loading: true,
    }
  }

  getPages(pageNumber) {
    const pageIndex = pageNumber - 1
    const page = pages[pageIndex] // TODO: Add fallback
    // Get next page to render / false on first page (cover) and last page
    const nextPage =
      pageIndex === 0 || pageNumber === pages.length
        ? null
        : pages[pageIndex + 1]
    const bookMode = this.state.bookMode
    return bookMode && nextPage ? [page, nextPage] : page
  }

  getCurrentPage() {
    const { currentPage } = this.state
    return this.viewer.world.getItemAt(0)
  }

  getTargetZoom() {
    const { viewport } = this.viewer
    const page = this.getCurrentPage()
    return page.source.dimensions.x / viewport.getContainerSize().x
  }

  zoomToOriginalSize() {
    const targetZoom = this.getTargetZoom()
    this.viewer.viewport.zoomTo(targetZoom, null, true)
  }

  jumpToPage(index) {
    console.log('jump:', index)
    this.setState({ currentPage: index })
    this.renderPage()
  }

  renderPage() {
    const { currentPage } = this.state
    const pages = this.getPages(currentPage)
    pages && this.viewer.open(pages, 1)
  }

  renderBookModeLayout() {
    const { viewport, world } = this.viewer
    const margin = 8 / viewport.getContainerSize().x
    const pos = new OpenSeaDragon.Point(0, 0)
    const count = world.getItemCount()
    for (let i = 0; i < count; i++) {
      const tiledImage = world.getItemAt(i)
      const bounds = tiledImage.getBounds()
      tiledImage.setPosition(pos, true)
      pos.x += bounds.width + margin
    }

    this.fitPages(true)
  }

  fitPages(fast = false) {
    const { viewport, world } = this.viewer
    const count = world.getItemCount()
    const tiledImage = world.getItemAt(0)
    const bounds = tiledImage.getBounds()
    const margin = 8 / viewport.getContainerSize().x
    bounds.width = (bounds.width + margin) * count
    viewport.fitBoundsWithConstraints(bounds, fast)
  }

  toggleMode(mode) {
    this.setState({ bookMode: mode })
    console.log(this.state.currentPage)

    // Re-render layout
    this.renderPage()
  }

  initOpenSeaDragon() {
    const { id, source } = this.props
    const { currentPage } = this.state
    this.viewer = OpenSeaDragon({
      id,
      ...OSDConfig,
      tileSources: this.getPages(currentPage),
    })

    this.viewer.addHandler('open', () => {
      const { viewport, world } = this.viewer
      const targetZoom = this.getTargetZoom()

      // Set Zoom options
      viewport.maxZoomLevel = targetZoom

      // Render Book mode
      this.renderBookModeLayout()
      this.setState({ loading: false })
    })

    this.viewer.addHandler('close', () => {
      this.setState({ loading: true })
    })

    /* Handle First render */
    const tileDrawnHandler = () => {
      this.viewer.removeHandler('tile-drawn', tileDrawnHandler)
      this.setState({ loading: false })
    }
    this.viewer.addHandler('tile-drawn', tileDrawnHandler)
  }

  /*
  componentShouldUpdate() {
      return false;
  }
*/
  // gets called when this route is navigated to
  componentDidMount() {
    // Initializa OSD instance
    this.initOpenSeaDragon()
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const { id } = this.props
    const { loading, currentPage } = this.state
    return (
      <div>
        <Toolbar
          onFitPages={this.fitPages.bind(this)}
          totalPages={pages.length}
          currentPage={currentPage}
          onPageChange={this.jumpToPage.bind(this)}
          onBookMode={this.toggleMode.bind(this)}
        />
        <div className={style.overlay + ' ' + (loading ? '' : style.hide)} />
        <div id={id} className={style.viewer} />
      </div>
    )
  }
}
