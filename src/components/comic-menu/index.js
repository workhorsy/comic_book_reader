import { h, Component } from 'preact';
//import { Link } from 'preact-router/match';
import { connect } from 'preact-redux';
import { bindActions } from '../../util';
import reduce from '../../reducers';
import style from './style';
import * as actions from '../../actions';
import { toggleFullScreen } from '../../lib/utility';

import ComicSettings from '../comic-settings';
import ComicLibrary from '../comic-library';
import ComicButton from '../comic-button';


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
export default class ComicMenu extends Component {
	state = {
		is_showing_settings: false,
		is_showing_library: false
	};

	onBtnFullScreen = () => {
		toggleFullScreen();
	}

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

	render() {
		let { props, state } = this;
		return (
			<div class={style.comic_menu}>
				<div id={style.topMenuPanel}>
					<div id={style.topMenuButtons}>
						<ComicButton id="btnFileLoad" onClick={this.onbtnOpenFile} icon={'open'}/>
						<ComicButton id="btnLibrary" translatable="true" onClick={this.onBtnLibrary}>Library</ComicButton>
						<ComicButton id="btnFullScreen" translatable="true" onClick={this.onBtnFullScreen}>Full Screen</ComicButton>
						<ComicButton id="btnSettings" translatable="true" onClick={this.onBtnSettings}>Settings</ComicButton>
					</div>

					<p><span id="loadError"></span></p>
					<div id="comicData">
						<span id="nameValue"></span><br />
					</div>

					<div>
						<div id="lblTotalUsersOnline" style="display: none;">
							<label translatable="true">Total users online</label> <span id="totalUsersOnline">?</span>
						</div>
					</div>

					{ state.is_showing_settings && <ComicSettings /> }
					{ state.is_showing_library && <ComicLibrary {...TestData}/> }

				</div>
			</div>
		);
	}
}
