import { connect } from 'unistore/preact'
import Settings from './view.jsx'
import actions from '../../unistore/actions/settings'

export default connect('settings', actions)(Settings)
