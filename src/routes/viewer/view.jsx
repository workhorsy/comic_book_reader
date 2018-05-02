import { h, Component } from 'preact'
import style from './style'

import { route } from 'preact-router'
import Reader from './components/reader'
import fetchArchive from './lib/fetchArchive.js'
import uncompressArchive from './lib/uncompress.js'
import uncompressWorker from './lib/uncompress.worker.js'

export default class Viewer extends Component {
  constructor(props) {
    super(props)
    const { addPage } = this.props
    this.worker = null
  }

  // Embed API
  handleQuery() {
    const { matches, setCurrentPage, reader } = this.props
    const { file, pg } = matches

    /* Load file */
    file && this.handleUncompress(file)

    /* Set initial page */
    const pageNumber = parseInt(pg, 10)
    pg && pg > 0 && pg != reader.currentPage && setCurrentPage(pageNumber)
  }

  handleUncompress(file) {
    const { worker } = this

    fetchArchive(file, array_buffer => {
      // Build message
      const message = {
        action: 'uncompress:start',
        file_name: 'example.rar',
        password: null,
        array_buffer,
      }

      worker.postMessage(message)
      //uncompressArchive(data);
    })
  }

  componentWillMount() {
    // Embed API

    this.worker = new uncompressWorker()
    this.worker.onmessage = e => {
      // Handle errors
      if (e.data.action === 'error') {
        console.error(e.data.error)
        this.worker.terminate()
      }
    }

    // Test: REMOVE
    // https://bookofbadarguments.com
    const { addPage } = this.props
    addPage('https://bookofbadarguments.com/images/1.jpg')
    addPage('https://bookofbadarguments.com/images/appeal_to_consequences.png')
    addPage('https://bookofbadarguments.com/images/irrelevant_authority.png')
  }

  // gets called when this route is navigated to
  componentDidMount() {
    this.handleQuery()
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  componentShouldUpdate() {
    return fasle
  }

  render() {
    const { pages, isLoading } = this.props.reader

    return (
      <div className={`${style.view}`}>
        <div className={style.overlay + ' ' + (isLoading ? '' : style.hide)}>
          <h1>Loading...</h1>
        </div>
        {pages.length > 0 && <Reader id={'OSD'} {...this.props} />}
      </div>
    )
  }
}
