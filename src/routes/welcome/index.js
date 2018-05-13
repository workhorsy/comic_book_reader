import { h, Component } from 'preact'
import style from './style'

import { route } from 'preact-router'
import Footer from '../../components/footer'
import Button from '../../components/button'
import Icon from '../../components/icon'

export default class Welcome extends Component {
  state = {}

  showApp(e) {
    route('/reader')
  }

  navigate(url) {
    window.location.href = url
  }

  // gets called when this route is navigated to
  componentDidMount() {}

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    return (
      <div class={style.view}>
        <section className={style.main}>
          <img src="./assets/logo.svg" className={style.logo} alt="" />
          <p class={style.description} translatable="true">
            An open source and touch friendly <br />{' '}
            <span class={style.focus}>Html5</span> comic book reader.
          </p>
          <Button onClick={e => this.showApp()}>Try it now</Button>
        </section>

        <section className={style.light}>
          <h1 className={style.title}>Made with ❤️ for the web!</h1>
          <div clasName={style.cards}>
            <div class={style.card}>
              <Icon name={['fab', 'github']} className={style.thumbnail} />
              <h3>Open source</h3>
              <p>MIT license, feel free to visit the Github project page.</p>
              <Button
                onClick={e =>
                  this.navigate(
                    'https://github.com/workhorsy/comic_book_reader'
                  )
                }
              >
                Learn More
              </Button>
            </div>
            <div class={style.card}>
              <Icon name={'file-archive'} className={style.thumbnail} />
              <h3>Archives</h3>
              <p>Compatible with most digital comic book archives. </p>
              <Button
                onClick={e =>
                  this.navigate(
                    'https://en.wikipedia.org/wiki/Comic_book_archive'
                  )
                }
              >
                Learn More
              </Button>
            </div>
            <div class={style.card}>
              <Icon name={'file-code'} className={style.thumbnail} />
              <h3>Metadata</h3>
              <p>Read metadata from your comics files.</p>
              <Button
                onClick={e =>
                  this.navigate(
                    'https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=3168&context=libphilprac'
                  )
                }
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    )
  }
}
