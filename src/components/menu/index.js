import { h, Component } from 'preact';
//import { Link } from 'preact-router/match';
import { connect } from 'preact-redux';
import { bindActions } from '../../util';
import reduce from '../../reducers';
import style from './style';
import * as actions from '../../actions';
import { toggleFullScreen } from '../../lib/utility';
import Icon from '../../components/icon'


const Item = ({label, icon, onClick}) => {
	const action = (event) => onClick && onClick(event);
	return (
		<div class={style.item}>
			{icon && <Icon name={icon}/>}
        	<span class={style.label}>{label}</span>
		</div>
    );
};

// Internal button
const Button =  ({label, icon, onClick}) => {
		const action = (event) => onClick && onClick(event);
		return (
			<button class={style.button} title={label} onClick={action}>
				{icon && <Icon name={icon}/>}
				<div class={style.line}></div>
			</button>
		);
};



//Test data for ComicLibrary ( remove this )
const TestData = {
	items: [
		{ title: 'Issue #1', cover: './assets/undefined.png' },
		{ title: 'Issue #2', cover: './assets/undefined.png' },
		{ title: 'Issue #3', cover: './assets/undefined.png' },
		{ title: 'Issue #4', cover: './assets/undefined.png' },
		{ title: 'Issue #5', cover: './assets/undefined.png' }
	]
}

@connect(reduce, bindActions(actions))
export default class Menu extends Component {
	state = {
		is_showing_settings: false,
		is_showing_library: false
	};

	onBtnFullScreen = () => {
		toggleFullScreen();
	}
	/*
	onbtnOpenFile = () => {
		alert("FIXME: onbtnOpenFile");
		this.setState({ text: 'ADD_COMIC' });
		console.log(this.state.text);
	}

	onBtnSettings = () => {
		this.setState(prevState => ({ is_showing_settings: !prevState.is_showing_settings }));
		this.setState({ is_showing_library: false });
	}

	onBtnLibrary = () => {
		this.setState(prevState => ({ is_showing_library: !prevState.is_showing_library }));
		this.setState({ is_showing_settings: false });
	}

	<Button id="btnFileLoad" onClick={null} icon={'folder'}/>
	<Button id="btnLibrary" onClick={null} icon={'bookmark'} />
	<Button id="btnFullScreen" onClick={null} icon={'expand'}/>
	<Button id="btnSettings" onClick={null} icon={'cog'} />
	*/

	render() {
		let { props, state } = this;
		return (
			<nav class={style.comic_menu}>
			  <Item label={"CBR"} />
			  <Button id="btnFileLoad" onClick={null} icon={'bars'}/>
			</nav>
		);
	}
}
