import { h, Component } from 'preact'
import style from './style'

import { route } from 'preact-router'
import Button from '../../components/button'

export default class Welcome extends Component {
  state = {}

  showApp(e) {
    route('/file')
  }

  // gets called when this route is navigated to
  componentDidMount() {}

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    return (
      <div class={style.view}>
        <h1 class={style.title} translatable="true">
          Comic Book Reader
        </h1>
        <p class={style.description} translatable="true">
          A touch friendly HTML5 comic book reader that reads <span class={style.focus}>CBR,</span>{' '}
          <span class={style.focus}>CBZ,</span> <span class={style.focus}>CBT,</span> and{' '}
          <span class={style.focus}>PDF files.</span>
        </p>

        <Button onClick={this.showApp} translatable="true">
          Start
        </Button>

        <footer>
          Copyright &copy; 2017{' '}
          <a href="https://github.com/workhorsy/comic_book_reader">Matthew Brennan Jones</a>
        </footer>
      </div>
    )
  }
}
