import FontAwesomeIcon from '@fortawesome/react-fontawesome'

import style from './style'

console.log(style.icon)
const Icon = ({ name }) => (
  <i className={style.icon}>
    <FontAwesomeIcon icon={name} size="xs" fixedWidth />
  </i>
)

export default Icon
