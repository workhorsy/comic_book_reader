import { h, Component } from 'preact';
//import { Link } from 'preact-router/match';
import style from './style';

import ComicButton from '../comic-button';
import ComicCheckBox from '../comic-check-box';

export default class ComicSettings extends Component {
	render() {
		return (
			<div class={style.comic_settings}>
				<div id={style.settingsMenu}>
					<div>
						<p>
							<label>Language: </label>
							<select id="btnSelectLanguage">
								<option value="en">English</option>
								<option value="ar">Arabic (عربى)</option>
								<option value="zh">Chinese (中文)</option>
								<option value="fr">French (français)</option>
								<option value="de">German (Deutsche)</option>
								<option value="ja">Japanese (日本語)</option>
								<option value="pt">Portuguese (Português)</option>
								<option value="ru">Russian (русский)</option>
								<option value="es">Spanish (Español)</option>
							</select>
						</p>
						<hr />
						<p>
							<ComicCheckBox id="btnDisableRightClick">Allow right click</ComicCheckBox>
						</p>
						<p>
							<ComicCheckBox id="btnEnableInstallUpdates">Check for updates</ComicCheckBox>
						</p>
						<p>
							<ComicCheckBox id="btnUseHigherQualityPreviews">Use higher quality page previews</ComicCheckBox>
						</p>
						<p>
							<ComicCheckBox id="btnUseSmoothingWhenResizingImages">Use smoothing when resizing images</ComicCheckBox>
						</p>
						<hr />
						<p>
							<label>Storage used:</label>
							<span id="totalDBSize" style="margin: 4px;">. . .</span>
						</p>
						<p>
							<ComicButton id="btnClearAllData">Clear all data</ComicButton>
						</p>
						<hr />
						<p>
							<label>Software Version:</label>
							<span id="versionDate" style="margin: 4px;">...</span>
						</p>
						<p>
							<ComicButton id="btnCheckForUpdatesNow" style="display: none;">Check for updates now</ComicButton>
						</p>
						<p>
							<ComicButton id="btnHomepage">Visit home page at github</ComicButton>
						</p>
					</div>
				</div>
			</div>
		);
	}
}
