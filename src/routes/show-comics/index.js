import { h, Component } from 'preact';
import style from './style';

import ComicMenu from '../../components/comic-menu';

export default class ShowComics extends Component {
	state = {
	};

	// gets called when this route is navigated to
	componentDidMount() {
	}

	// gets called just before navigating away from the route
	componentWillUnmount() {
	}


	render() {
		return (
			<div class={style.show_comics}>
				<ComicMenu />
			</div>
		);
	}
}
