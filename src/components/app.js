import { h, Component } from 'preact';
import { Router } from 'preact-router';

import Welcome from '../routes/welcome';
import ShowComics from '../routes/show-comics';

export default class App extends Component {
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<div id="app">
				<Router onChange={this.handleRoute}>
					<Welcome path="/" />
					<ShowComics path="/show" />
				</Router>
			</div>
		);
	}
}
