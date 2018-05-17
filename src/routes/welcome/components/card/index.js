import Button from '../../../../components/button'
import Icon from '../../../../components/icon'
import style from './style'

const navigate = href => {
  window.location = href
}

const Card = ({ title, description, link, icon }) => (
  <div class={style.card}>
    {icon && <Icon name={icon} className={style.thumbnail} />}
    <h3>{title}</h3>
    <p>{description}</p>
    {link && <Button onClick={e => navigate(link)}>Learn More</Button>}
  </div>
)

export default Card
