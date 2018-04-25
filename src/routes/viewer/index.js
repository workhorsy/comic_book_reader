import { h, Component } from 'preact'
import style from './style'

import { route } from 'preact-router'
import Reader from './components/reader'
import Toolbar from './components/toolbar'
import Button from '../../components/button'

export default class Viewer extends Component {
  constructor(props) {
    super(props)
  }

  // gets called when this route is navigated to
  componentDidMount() {}

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const { source } = this.props
    return (
      <div className={`${style.view}`}>
        <Toolbar />
        <Reader
          id={'OSD'}
          source={
            'https://bookofbadarguments.com/images/appeal_to_bandwagon.png'
          }
        />
      </div>
    )
  }
}
