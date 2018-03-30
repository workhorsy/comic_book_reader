import { h, Component } from 'preact';
import style from './style';

import { route } from 'preact-router';
import Icon from '../../components/icon';
import Button from '../../components/button';


const FileInput = ({filters, ref, onChange}) => (
		<input type="file" ref={ref}
		  style={{display: 'none'}}
		  accept={filters.join(', ')}
		  onChange={event => onChange(event.target.files[0])}
		  />
	  );

export default class File extends Component {
	state = {
		file: null,
	};

	constructor(props) {
		super(props);
		this.filters = ['.pdf', '.cbr', '.cbt', '.cbz'];
	}

	OpenLibrary() {
		route('/library');
	}

	handleFile(file) {
		this.setState({file: file});
	}

	ChooseFile() {
		// Open file dialog
		console.log(this.fileInput);
		this.fileInput.base.click();
	}

	// gets called when this route is navigated to
	componentDidMount() {
	}

	// gets called just before navigating away from the route
	componentWillUnmount() {
	}

	render() {
		return (
			<div class={style.welcome}>
				<h1 class={style.title} translatable="true">
					<Icon name={'arrow-down'}/>
				</h1>
				<p class={style.description} translatable="true">
				Choose a file or drop it here.
				</p>
				<FileInput ref={c => this.fileInput = c} filters={this.filters} onChange={this.handleFile}/>
				<Button icon="folder" onClick={this.ChooseFile.bind(this)}>Choose file</Button>
				<Button icon="bookmark" type="secondary" onClick={this.OpenLibrary}>Open library</Button>
			</div>
		);
	}
}
