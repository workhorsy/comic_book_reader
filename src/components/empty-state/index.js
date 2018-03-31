import { h, Component } from 'preact';
import style from './style';

import Icon from '../../components/icon'

export default class EmptyState extends Component {
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
		const { props, state } = this;
		const Message = props.message;
		const type = props.type ? style[props.type] : '';

		return (
			<div class={style.view}>
				<h1 class={style.title} translatable="true">
					<Icon name={props.icon}/>
					<div class={style.title}>{props.title}</div>
				</h1>
				<p class={style.message} translatable="true">{Message && <Message/>}</p>
				<div class={style.actions}></div>
			</div>);
	}
}
