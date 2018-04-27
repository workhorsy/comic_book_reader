import { h, Component } from 'preact'
import OpenSeaDragon from 'openseadragon'
import style from './style'
import OSDConfig from './osd.config.js'
import Toolbar from '../toolbar';

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
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Little_nemo_the_walking_bed.jpg',
    buildPyramid: false,
  },
  {
    type: 'image',
    url:
      'https://upload.wikimedia.org/wikipedia/commons/6/6b/Little_nemo_the_walking_bed.jpg',
    buildPyramid: false,
},
]

export default class Reader extends Component {
  constructor(props) {
    super(props)
    this.viewer = null
    this.state = {
      currentPage: 0,
      bookMode: true,
    }
  }

  getPages(index) {
      const pageIndex = index - 1;
      const page = pages[pageIndex]; // Add fallback;
      const nextPage = pages[pageIndex + 1];
      const bookMode = this.state.bookMode; // && (index % 2 == 0);
      return (bookMode && nextPage) ? [page, nextPage] : page;
  }

  getCurrentPage() {
    const { currentPage } = this.state
    return this.viewer.world.getItemAt(currentPage)
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
      const pages = this.getPages(index);
      console.log(pages, index);
      pages && this.viewer.open(pages, 1);
  }

  renderBookModeLayout() {
    let tiledImage, bounds
    const { viewport, world } = this.viewer
    const margin = 16 / viewport.getContainerSize().x
    const pos = new OpenSeaDragon.Point(0, 0)
    const count = world.getItemCount()
    for (let i = 0; i < count; i++) {
      tiledImage = world.getItemAt(i)
      bounds = tiledImage.getBounds()
      tiledImage.setPosition(pos, false)
      pos.x += bounds.width + margin
    }
    bounds.width = (bounds.width + margin) * 2
    viewport.fitBoundsWithConstraints(bounds, true)
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
      viewport.defaultZoomLevel = targetZoom
      viewport.minZoomLevel = targetZoom / 2

      // Render Book mode
      this.renderBookModeLayout()
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  // gets called when this route is navigated to
  componentDidMount() {
    this.initOpenSeaDragon()
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const { id } = this.props
    return (
        <div>
          <Toolbar totalPages={pages.length} onPageChange={this.renderPage.bind(this)} />
          <div  id={id} className={style.viewer} />
        </div>
    )
  }
}
