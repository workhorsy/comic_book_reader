import { h, Component } from 'preact';
//import { Link } from 'preact-router/match';
import style from './style';

export default class ComicCheckBox extends Component {
	state = {
	};

	componentDidMount() {
	}

	render() {
		return (
			<div class={style.comic_check_box}>
				<input id={this.props.id} type="checkbox" />
				<label for={this.props.id}>
					{this.props.children.length > 0 ? this.props.children[0] : null}
				</label>
			</div>
		);
	}
}
