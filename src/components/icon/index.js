import FontAwesomeIcon from '@fortawesome/react-fontawesome'

import style from './style'

console.log(style.icon)
const Icon = ({name, className}) => {
    return (
        <FontAwesomeIcon  className={[style.icon, className].join(' ') }icon={name} size="xs" fixedWidth />
    )
}

export default Icon
