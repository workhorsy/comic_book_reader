import { connect } from 'unistore/preact'
import Viewer from './view.jsx'
import actions from '../../unistore/actions/reader'

export default connect('reader', actions)(Viewer)
