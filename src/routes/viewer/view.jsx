import { h, Component } from 'preact'
import style from './style'

import { route } from 'preact-router'
import Reader from './components/reader'

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
  }

  // gets called when this route is navigated to
  componentDidMount() {
    const { addPage } = this.props

    // Test
    addPage('https://bookofbadarguments.com/images/1.jpg')
    addPage('https://bookofbadarguments.com/images/appeal_to_consequences.png')
    addPage('https://bookofbadarguments.com/images/irrelevant_authority.png')
    addPage('https://bookofbadarguments.com/images/appeal_to_consequences.png')
    addPage('https://bookofbadarguments.com/images/irrelevant_authority.png')
    addPage('https://bookofbadarguments.com/images/appeal_to_consequences.png')
    addPage('https://bookofbadarguments.com/images/irrelevant_authority.png')
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const { pages, isLoading } = this.props.reader
    return (
      <div className={`${style.view}`}>
        <div className={style.overlay + ' ' + (isLoading ? '' : style.hide)} />
        {pages.length > 0 && <Reader id={'OSD'} {...this.props} />}
      </div>
    )
  }
}
