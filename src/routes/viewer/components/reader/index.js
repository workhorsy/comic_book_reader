import { h, Component } from 'preact'
import OpenSeaDragon from 'openseadragon'
import style from './style'
import OSDConfig from './osd.config.js'
import Toolbar from '../toolbar'

// Test
const pages = [
  {
    type: 'image',
    url: 'https://bookofbadarguments.com/images/appeal_to_consequences.png',
    buildPyramid: false,
  },
  {
    type: 'image',
    url:
      'https://laughingsquid.com/wp-content/uploads/2013/09/20130916-17283299-2.png',
    buildPyramid: false,
  },
  {
    type: 'image',
    url:
      'https://upload.wikimedia.org/wikipedia/commons/6/6b/Little_nemo_the_walking_bed.jpg',
    buildPyramid: false,
  },
  {
    type: 'image',
    url:
      'https://upload.wikimedia.org/wikipedia/commons/6/6b/Little_nemo_the_walking_bed.jpg',
    buildPyramid: false,
  },
]

// Heavy test
pages.push({
  type: 'image',
  url:
    'https://www.bluecross.org.uk/sites/default/files/assets/images/Cat%20for%20lost%20page.jpg',
  buildPyramid: false,
})

export default class Reader extends Component {
  constructor(props) {
    super(props)
    this.viewer = null
    this.state = {
      currentPage: 1,
      bookMode: false,
      loading: true,
    }
  }

  getPages(index) {
    const pageIndex = index - 1
    const page = pages[pageIndex] // Add fallback;
    const nextPage = pages[pageIndex + 1]
    const bookMode = this.state.bookMode // && (index % 2 == 0);
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

  renderPage(index) {
    const pages = this.getPages(index)
    pages && this.viewer.open(pages, 1)
    this.setState({ currentPage: index })
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
    this.renderPage(this.state.currentPage)
  }

  initOpenSeaDragon() {
    let { id, source } = this.props

    this.viewer = OpenSeaDragon({
      id: id,
      tileSources: this.getPages(1),
      ...OSDConfig,
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
    this.initOpenSeaDragon()
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const { id } = this.props
    const { loading } = this.state
    return (
      <div>
        <Toolbar
          onFitPages={this.fitPages.bind(this)}
          totalPages={pages.length}
          onPageChange={this.renderPage.bind(this)}
          onBookMode={this.toggleMode.bind(this)}
        />
        <div className={style.overlay + ' ' + (loading ? '' : style.hide)} />
        <div id={id} className={style.viewer} />
      </div>
    )
  }
}
