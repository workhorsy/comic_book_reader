import { h, Component } from 'preact';
import style from './style';

import { route } from 'preact-router';
import Icon from '../../components/icon';
import Button from '../../components/button';

export default class File extends Component {
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
				<h1 class={style.title} translatable="true">
					<Icon name={'arrow-down'}/>
				</h1>
				<p class={style.description} translatable="true">
				Choose a file or drop it here.
				</p>
				<Button icon="folder">Choose file</Button>
				<Button icon="bookmark" type="secondary">Open library</Button>

			</div>
		);
	}
}
