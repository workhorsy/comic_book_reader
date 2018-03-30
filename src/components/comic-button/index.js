import { h, Component } from 'preact';
//import { Link } from 'preact-router/match';
import style from './style';

import Icon from '../../components/icon'

export default class ComicButton extends Component {
	state = {
	};

	handleMouseUp = (event) => {
		//console.log(this.props.children[0]);
		this.props.onClick && this.props.onClick(event);
	};

	componentDidMount() {
		//console.log(this.props.text);
	}

	render() {
		let { props, state } = this;
		return (
			<button
				class={style.comic_button}
				onMouseUp={this.handleMouseUp}
			>   {props.icon && <Icon name={props.icon} />}
				{ props.children.length > 0 && props.children[0] }
			</button>
		);
	}
}
