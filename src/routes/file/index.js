import { h, Component } from 'preact';
import style from './style';

import { route } from 'preact-router';
import Icon from '../../components/icon';
import Button from '../../components/button';


const FileInput = ({filters, onChange}) => (
		<input type="file"
		  style={{display: 'none'}}
		  accept={filters.join(', ')}
		  onChange={event => onChange(event.target.files[0])}
		  />
	  );

export default class File extends Component {
	state = {
		file: null,
		drag: false
	};

	constructor(props) {
		super(props);
		this.filters = ['.pdf', '.cbr', '.cbt', '.cbz'];
	}

	openLibrary() {
		route('/library');
	}

	handleFile(file) {
		file && this.setState({file});
	}

	openFile() {
		// Open file dialog
		console.log(this.fileInput);
		this.fileInput.base.click();
	}

	handleDrop(event) {
		event.preventDefault();
		const { files } = event.dataTransfer;
		const file = files ? files[0] : null;
		this.setState({file, drag: false});
	}

	handleDragOver(event) {
		event.preventDefault();
		this.setState({ drag: true});
	}
	handleDragLeave() {
		this.setState({drag: false});
	}


	// gets called when this route is navigated to
	componentDidMount() {
	}

	// gets called just before navigating away from the route
	componentWillUnmount() {
	}

	render() {
		const drag = this.state.drag ? style.drag : "";

		return (
			<div class={`${style.view} ${drag}`} ondrop={this.handleDrop.bind(this)} ondragleave={this.handleDragLeave.bind(this)} ondragover={this.handleDragOver.bind(this)}>
				<h1 class={style.title} translatable="true">
					<Icon name={'arrow-down'}/>
				</h1>
				<p class={style.description} translatable="true">
				Choose a file or drop it here.
				</p>
				<FileInput ref={c => this.fileInput = c} filters={this.filters} onChange={this.handleFile}/>
				<div class={style.actions}>
				  <Button icon="folder" onClick={this.openFile.bind(this)}>Choose file</Button>
				  <Button icon="bookmark" type="secondary" onClick={this.openLibrary}>Open library</Button>
				</div>
			</div>
		);
	}
}
