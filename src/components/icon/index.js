import FontAwesomeIcon from '@fortawesome/react-fontawesome'

import style from './style'

console.log(style.icon)
const Icon = ({ name, className }) => (
  <i className={[style.icon, className].join(' ')}>
    <FontAwesomeIcon icon={name} size="xs" fixedWidth />
  </i>
)

export default Icon
