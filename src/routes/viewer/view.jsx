import { h, Component } from 'preact'
import style from './style'

import { route } from 'preact-router'
import Reader from './components/reader'

import readerWorker from './lib/reader.worker.js'

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
    // FIX: (Use fetch API)
    function httpRequest(url, method, cb, timeout) {
      timeout = timeout || 10000
      let xhr = new XMLHttpRequest()
      xhr.onreadystatechange = function() {
        if (this.readyState === 4) {
          cb(this.response, this.status)
        } else if (this.readyState === 0) {
          cb(null)
        }
      }
      xhr.onerror = function() {
        cb(null)
      }
      xhr.open(method, url, true)
      xhr.timeout = timeout
      xhr.responseType = 'blob'
      xhr.send(null)
    }

    // TEST: Broken!
    const worker = this.worker
    httpRequest(file, 'GET', (response, status) => {
      if (status === 200) {
        let fileReader = new FileReader()
        fileReader.onload = function() {
          let array_buffer = this.result
          // Debug
          console.log('Reading archive: ', file)

          worker.postMessage({
            action: 'uncompress:start',
            data: {
              file_name: 'example_rar_5.rar',
              password: null,
              array_buffer,
            },
          })
        }
        fileReader.readAsArrayBuffer(response)
      } else {
        console.error('Failed to download file with status: ', status)
      }
    })
    /*
      fetch('').then(res => res.arrayBuffer()).then(buffer => {
          this.worker.postMessage({action: 'uncompress:start', data: {
              array_buffer: buffer, file_name: 'example.rar', password: null
          }});
      })
      */
  }

  componentWillMount() {
    // Embed API

    this.worker = new readerWorker()
    this.worker.onmessage = e => console.log(e.data)

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
