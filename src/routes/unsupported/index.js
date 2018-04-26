import { h, Component } from 'preact'
import style from './style'

export default class Unsupported extends Component {
  render() {
    return (
      <div class={style.view}>
        <h1 class={style.title} translatable="true">
          Error!
        </h1>
        <p class={style.description} translatable="true">
          Your browser is missing features required to run this program.
        </p>
      </div>
    )
  }
}
