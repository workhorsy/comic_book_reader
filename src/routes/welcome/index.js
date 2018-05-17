import { h, Component } from 'preact'
import style from './style'

import { route } from 'preact-router'
import Footer from '../../components/footer'
import Button from '../../components/button'
import Icon from '../../components/icon'

import Card from './components/card'
import GithubCorner from './components/githubCorner'

// Links
const ArchiveLink = 'https://en.wikipedia.org/wiki/Comic_book_archive'
const MetadataLink =
  'https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=3168&context=libphilprac'
const RepositoryLink = 'https://github.com/workhorsy/comic_book_reader'

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
          <GithubCorner repository={RepositoryLink} />
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
            <Card
              icon={['fab', 'github']}
              title={'Open source'}
              description={
                'MIT license, feel free to visit the Github project page.'
              }
              link={RepositoryLink}
            />
            <Card
              icon={'file-archive'}
              title={'Archives'}
              description={'Compatible with most digital comic book archives.'}
              link={ArchiveLink}
            />
            <Card
              icon={'file-code'}
              title={'Metadata'}
              description={'Read metadata from your comics files.'}
              link={MetadataLink}
            />
          </div>
        </section>

        <Footer />
      </div>
    )
  }
}
