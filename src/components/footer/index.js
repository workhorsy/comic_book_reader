import { h, Component } from 'preact'
export default class Footer extends Component {
  state = {}

  componentDidMount() {
    //console.log(this.props.text);
  }

  render() {
    const { props, state } = this
    const year = new Date().getFullYear()

    return (
      <footer>
        <div>
          Copyright &copy; 2017 - {year} Comic Book Reader{' '}
          <a
            href="https://github.com/workhorsy/comic_book_reader/tree/preact#contributors"
            native
          >
            Developers
          </a>
        </div>
      </footer>
    )
  }
}
