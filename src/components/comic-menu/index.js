import { h, Component } from 'preact';
//import { Link } from 'preact-router/match';
import style from './style';
import { toggleFullScreen } from '../../lib/utility';

import ComicSettings from '../comic-settings';
import ComicButton from '../comic-button';

export default class ComicMenu extends Component {
	state = {
		is_showing_settings: false,
		is_showing_library: false
	};

	onBtnFullScreen = () => {
		toggleFullScreen();
	}

	onBtnSettings = () => {
		this.setState(prevState => ({ is_showing_settings: !prevState.is_showing_settings }));
		this.setState({ is_showing_library: false });
	}

	render() {
		let { props, state } = this;
		return (
			<div class={style.comic_menu}>
				<div id={style.topMenuPanel}>
					<div id={style.topMenuButtons}>
						<ComicButton id="btnFileLoad" translatable="true">Open comic file</ComicButton>
						<ComicButton id="btnLibrary" translatable="true">Library</ComicButton>
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

				</div>
			</div>
		);
	}
}
