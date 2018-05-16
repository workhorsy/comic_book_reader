import { h, Component } from 'preact'
import style from './style'

// Components
import { route } from 'preact-router'
import Files from './components/files'
import Reader from './components/reader'
import Loader from './components/loader'
import ErrorMessage from './components/error'

// Utils
import fetchArchive from './lib/fetchArchive.js'
import uncompressWorker from './lib/uncompress.worker.js'

export default class Viewer extends Component {
  constructor(props) {
    super(props)
    this.reader = null
    this.worker = null
  }

  handleQuery() {
    // Embed API
    const { matches, setCurrentPage, reader } = this.props
    const { file, pg } = matches

    /* Load file */
    file && this.handleUncompress(file)

    /* Set initial page */
    const pageNumber = parseInt(pg, 10)
    pg && pg > 0 && pg != reader.currentPage && setCurrentPage(pageNumber)
  }

  handleUncompress(file) {
    fetchArchive(file, array_buffer => {
      // Build message
      const message = {
        action: 'uncompress_buffer_start',
        payload: {
          file_name: 'archive',
          password: null,
          array_buffer,
        },
      }
      // Post message to worker
      this.worker.postMessage(message)
    })
  }

  handleUpload(file) {
    const message = {
      action: 'uncompress_file_start',
      payload: { file, password: null },
    }
    // Post message to worker
    this.worker.postMessage(message)
  }

  componentWillMount() {
    const { addPage, setLoadedArchive } = this.props
    // Worker Events
    const actions = {
      ready: data => {
        this.handleQuery()
      },
      error: data => {
        console.error(data.error)
        this.worker.terminate()
      },
    }

    actions.uncompress_each = payload => {
      const { file } = payload
      addPage(file)
    }

    actions.uncompress_cover = payload => {
      const { file, archive } = payload
      archive && setLoadedArchive(archive)
      file && addPage(file)
    }

    // Handle messages from worker thread
    const handleMessage = (action, data) => {
      actions[action] && actions[action](data)
    }

    // Create new worker
    this.worker = new uncompressWorker()

    // Listen messages from worker
    this.worker.onmessage = e => {
      const { action, payload } = e.data
      handleMessage(action, payload)
    }
  }

  // Gets called when this route is navigated to
  componentDidMount() {}

  // Gets called just before navigating away from the route
  componentWillUnmount() {}

  // Prevent updates
  componentShouldUpdate() {
    return fasle
  }

  render() {
    const { matches, reader } = this.props
    const { pages, isLoading, error } = reader
    const { file } = matches
    const showReader = pages.length > 0

    let toolbar = null
    if (this.reader) {
      toolbar = this.reader.toolbar
    }

    return (
      <div className={`${style.view}`}>
        {!showReader && <Files onUpload={this.handleUpload.bind(this)} />}
        {error && (
          <ErrorMessage
            action={() => toolbar && toolbar.navigation.nextPage()}
          />
        )}
        {showReader && <Loader isLoading={isLoading} />}
        {showReader && (
          <Reader id={'OSD'} {...this.props} ref={c => (this.reader = c)} />
        )}
      </div>
    )
  }
}
