import { h, Component } from 'preact';
import style from './style';

import { route } from 'preact-router';
import ComicButton from '../../components/comic-button';

export default class Welcome extends Component {
	state = {
	};

	showApp(e) {
		route('/show');
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
				<h1 translatable="true">Comic Book Reader</h1>
				<p translatable="true">
					A touch friendly HTML5 comic book reader that reads CBR, CBZ, CBT, and PDF files.
				</p>
				<p>
					<ComicButton onClick={this.showApp} translatable="true">Start</ComicButton>
				</p>
				<footer>
					Copyright &copy; 2017 <a href="https://github.com/workhorsy/comic_book_reader">
						Matthew Brennan Jones</a>
				</footer>
			</div>
		);
	}
}
