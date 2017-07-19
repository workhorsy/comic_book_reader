import { h, Component } from 'preact';
//import { Link } from 'preact-router/match';
import style from './style';

export default class ComicButton extends Component {
	state = {
	};

	handleMouseUp = (event) => {
		//console.log(this.props.children[0]);
		if (this.props.onClick) {
			this.props.onClick(event);
		}
	};

	componentDidMount() {
		//console.log(this.props.text);
	}

	render() {
		return (
			<button
				class={style.comic_button}
				onMouseUp={this.handleMouseUp}
			>
				{this.props.children.length > 0 ? this.props.children[0] : null}
			</button>
		);
	}
}
