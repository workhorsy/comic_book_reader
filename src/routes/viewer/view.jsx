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
    file && console.log('Loading...')

    /* Set initial page */
    const pageNumber = parseInt(pg, 10)
    pg && pg > 0 && pg != reader.currentPage && setCurrentPage(pageNumber)
  }
  componentWillMount() {
    // Embed API
    this.handleQuery()
    this.worker = new readerWorker()

    // Test: REMOVE
    // https://bookofbadarguments.com
    const { addPage } = this.props
    addPage('https://bookofbadarguments.com/images/1.jpg')
    addPage('https://bookofbadarguments.com/images/appeal_to_consequences.png')
    addPage('https://bookofbadarguments.com/images/irrelevant_authority.png')
  }

  // gets called when this route is navigated to
  componentDidMount() {}

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
