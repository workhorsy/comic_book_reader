import { h, Component } from 'preact'
import Icon from '../../../../components/icon'
import Button from '../../../../components/button'
import style from './style'

const FileInput = ({ filters, onChange }) => (
  <input
    type="file"
    style={{ display: 'none' }}
    accept={filters.join(', ')}
    onChange={event => onChange(event.target.files[0])}
  />
)

export default class Files extends Component {
  state = {
    file: null,
    drag: false,
  }

  constructor(props) {
    super(props)
    this.filters = ['.pdf', '.cbr', '.cbt', '.cbz']
  }

  openLibrary() {
    route('library')
  }

  filterFile(name) {
    // Regex to detect archive type
    const regexArchive = new RegExp('^.+.(cbr|cbz|cbt)$')

    // Check if file is a valid archive
    return regexArchive.test(name)
  }

  handleFile(file) {
    const { onUpload } = this.props
    const valid = file && this.filterFile(file.name)
    valid && onUpload(file)
  }

  openFile() {
    // Open file dialog
    this.fileInput.base.click()
  }

  handleDrop(event) {
    event.preventDefault()
    const { files } = event.dataTransfer
    const file = files ? files[0] : null
    this.handleFile(file)
    this.setState({ drag: false })
  }

  handleDragOver(event) {
    event.preventDefault()
    !this.state.drag && this.setState({ drag: true })
  }

  handleDragLeave() {
    this.state.drag && this.setState({ drag: false })
  }

  handleError() {
    this.setState({ error: true })
  }

  // gets called when this route is navigated to
  componentDidMount() {
    window.addEventListener('drop', this.handleDrop.bind(this))
    window.addEventListener('dragover', this.handleDragOver.bind(this))
    window.addEventListener('dragleave', this.handleDragLeave.bind(this))
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {
    window.removeEventListener('drop', this.handleDrop.bind(this))
    window.removeEventListener('dragover', this.handleDragOver.bind(this))
    window.removeEventListener('dragleave', this.handleDragLeave.bind(this))
  }

  render() {
    const error = this.state.error ? style.error : ''
    const drag = this.state.drag ? style.drag : ''

    return (
      <div class={`${style.view} ${drag} ${error}`}>
        <div class={style.icon} translatable="true">
          <Icon name={drag ? 'arrow-down' : 'file-archive'} />
        </div>
        <p class={style.description} translatable="true">
          Choose a file or drop it here.
        </p>
        <FileInput
          ref={c => (this.fileInput = c)}
          filters={this.filters}
          onChange={this.handleFile.bind(this)}
        />
        <div class={style.actions}>
          <Button onClick={this.openFile.bind(this)}>Choose file</Button>
        </div>
      </div>
    )
  }
}
