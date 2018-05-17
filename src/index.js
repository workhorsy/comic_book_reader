import { h, render } from 'preact'
import { Provider } from 'unistore/preact'
import store from './unistore/store'
import App from './components/app'
import './style'

import fontawesome from '@fortawesome/fontawesome'

import brands from '@fortawesome/fontawesome-free-brands'
import faFolder from '@fortawesome/fontawesome-free-solid/faFolder'
import faCog from '@fortawesome/fontawesome-free-solid/faCog'
import faBars from '@fortawesome/fontawesome-free-solid/faBars'
import faBookOpen from '@fortawesome/fontawesome-free-solid/faBookOpen'
import faBookmark from '@fortawesome/fontawesome-free-solid/faBookmark'
import faArrowDown from '@fortawesome/fontawesome-free-solid/faArrowDown'
import faFile from '@fortawesome/fontawesome-free-solid/faFile'
import faFileArchive from '@fortawesome/fontawesome-free-solid/faFileArchive'
import faFileCode from '@fortawesome/fontawesome-free-solid/faFileCode'
import faQuestionCircle from '@fortawesome/fontawesome-free-solid/faQuestionCircle'
import faArrowRight from '@fortawesome/fontawesome-free-solid/faArrowRight'
import faArrowLeft from '@fortawesome/fontawesome-free-solid/faArrowLeft'
import faAngleRight from '@fortawesome/fontawesome-free-solid/faAngleRight'
import faAngleLeft from '@fortawesome/fontawesome-free-solid/faAngleLeft'
import faColumns from '@fortawesome/fontawesome-free-solid/faColumns'
import faExpand from '@fortawesome/fontawesome-free-solid/faExpand'
import faArrowsAlt from '@fortawesome/fontawesome-free-solid/faArrowsAlt'
import faExclamationTriangle from '@fortawesome/fontawesome-free-solid/faExclamationTriangle'

fontawesome.library.add(
  brands,
  faCog,
  faFolder,
  faBookOpen,
  faBookmark,
  faBars,
  faFile,
  faFileArchive,
  faQuestionCircle,
  faArrowDown,
  faFileCode,
  faArrowLeft,
  faArrowRight,
  faAngleLeft,
  faAngleRight,
  faColumns,
  faExpand,
  faArrowsAlt,
  faExclamationTriangle
)

render(
  <div id="outer">
    <Provider store={store}>
      <App />
    </Provider>
  </div>,
  document.body
)
