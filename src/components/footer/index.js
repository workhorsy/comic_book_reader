import { h, Component } from 'preact'
import style from './style'

export default class Footer extends Component {
  state = {}

  componentDidMount() {
    //console.log(this.props.text);
  }

  render() {
    const { props, state } = this
    const year = (new Date()).getFullYear()

    return (
        <footer>Copyright &copy; 2017 - {year} Comic Book Reader <a href="https://github.com/workhorsy/comic_book_reader#contributors">Developers</a></footer>
    )
  }
}
