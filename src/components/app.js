import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Welcome from '../routes/welcome';
import File from '../routes/file';
import Menu from './menu';

export default class App extends Component {
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<div id="app">
			    <Menu />
				<Router onChange={this.handleRoute}>
					<Welcome path="/" />
					<File path="/file" />
				</Router>
			</div>
		);
	}
}
