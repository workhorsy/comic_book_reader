import { h, Component } from 'preact'
import OpenSeaDragon from 'openseadragon'
import style from './style'

export default class Reader extends Component {
  constructor(props) {
    super(props)
    this.viewer = null
    this.state = {
      currentPage: 0,
    }
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

  // helper function to load image using promises
  loadImage = src =>
    new Promise(function(resolve, reject) {
      var img = document.createElement('img')
      img.addEventListener('load', function() {
        resolve(img)
      })
      img.addEventListener('error', function(err) {
        reject(404)
      })
      img.src = src
    })

  initOpenSeaDragon() {
    let { id, source } = this.props

    const config = {
      visibilityRatio: 1,
      constrainDuringPan: true,
      preserveImageSizeOnResize: true,
      sequenceMode: true,
      toolbar: false,
      showNavigationControl: false,
      showSequenceControl: false,
      //maxZoomPixelRatio: 1,
      //minPixelRatio: 1,
    }

    this.viewer = OpenSeaDragon({
      id: id,
      ...config,

      tileSources: {
        type: 'image',
        url: source,
        width: 100,
      },
    })

    this.viewer.addHandler('open', () => {
      const { viewport } = this.viewer
      const targetZoom = this.getTargetZoom()

      // Set Zoom options
      viewport.maxZoomLevel = targetZoom
      viewport.defaultZoomLevel = targetZoom
      viewport.minZoomLevel = targetZoom / 2
      viewer.clearControls()
      viewer.setControlsEnabled(false)

      this.zoomToOriginalSize()
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
    return <div id={id} className={style.viewer} />
  }
}
