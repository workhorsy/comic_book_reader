// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

const g_use_service_worker = false;//true;// FIXME
let g_is_terminated = false;
let g_file_name = null;
let g_image_index = 0;
let g_image_count = 0;
let g_titles = {};
let g_are_page_previews_loading = false;
let g_use_higher_quality_previews = false;
let g_screen_width = 0;
let g_screen_height = 0;
let g_top_menu_visible = 1.0;
let g_bottom_menu_visible = 0.0;

function requireBrowserFeatures(cb) {
	let errors = [];
	if ( !('transform' in document.body.style)) {
		errors.push('CSS transform');
	}
	if (typeof Blob === 'undefined') {
		errors.push('Blob');
	}
	if (typeof Object === 'undefined' || typeof Object.defineProperty === 'undefined') {
		errors.push('Object defineProperty');
	}
	if (typeof Object === 'undefined' || typeof Object.hasOwnProperty === 'undefined') {
		errors.push('Object hasOwnProperty');
	}
	if (typeof window.HTMLCanvasElement === 'undefined' ||
		typeof window.HTMLCanvasElement.prototype.getContext === 'undefined') {
		errors.push('Canvas Context');
	}
	if (typeof Uint8Array === 'undefined') {
		errors.push('Uint8Array');
	}
	if (typeof indexedDB === 'undefined') {
		errors.push('Indexed DB');
	}
	if (typeof localStorage === 'undefined') {
		errors.push('Local Storage');
	}
	if (typeof Worker === 'undefined') {
		errors.push('Web Worker');
	}
	if (typeof URL === 'undefined' || typeof URL.createObjectURL === 'undefined') {
		errors.push('Create Object URL');
	}
	if (typeof URL === 'undefined' || typeof URL.revokeObjectURL === 'undefined') {
		errors.push('Revoke Object URL');
	}
	if (typeof JSON === 'undefined' || typeof JSON.stringify === 'undefined') {
		errors.push('JSON Stringify');
	}
	if (typeof JSON === 'undefined' || typeof JSON.parse === 'undefined') {
		errors.push('JSON Parse');
	}
	if (typeof FileReader === 'undefined') {
		errors.push('File Reader');
	}
	if (typeof document.documentElement.requestFullscreen === 'undefined' &&
		typeof document.documentElement.msRequestFullscreen === 'undefined' &&
		typeof document.documentElement.mozRequestFullScreen === 'undefined' &&
		typeof document.documentElement.webkitRequestFullscreen === 'undefined') {
		errors.push('Request Full Screen');
	}

	function hasErrors(errors) {
		if (errors.length > 0) {
			let message = '<div class="errors">';
			message += '<h1>Your browser is missing features required to run this program:</h1>';
			for (let i=0; i<errors.length; ++i) {
				message += (errors[i] + ' is not supported!<br/>');
			}
			message += '</div>';
			document.body.innerHTML = message;
			return true;
		}

		return false;
	}

	if (! hasErrors(errors)) {
		// Test the Web Workers requirements
		let worker = new Worker('js/test_requirements_worker.js');
		worker.onmessage = function(e) {
			if (e.data.action === 'test_requirements') {
				let errors = e.data.errors;
				if (! hasErrors(errors)) {
					// Test Web Workers for transferable objects
					let array_buffer = new ArrayBuffer(1);
					let message = {
						action: 'test_transferable_objects',
						array_buffer: array_buffer
					};
					worker.postMessage(message, [array_buffer]);
					if (array_buffer.byteLength !== 0) {
						errors = ['Transferable Object'];
						hasErrors(errors);
					}
				}
			}
		};

		let message = {
			action: 'test_requirements'
		};
		worker.postMessage(message);
	}

	cb();
}

function hideAllMenus(is_instant) {
	hideTopMenu(is_instant);
	hideBottomMenu(is_instant);
}

function hideTopMenu(is_instant) {
	let speed = is_instant ? '0.0s' : '0.3s';

	// Hide the top menus
	hide('#settingsMenu');
	hide('#libraryMenu');
	$('#libraryMenu').innerHTML = '';
	show('#bottomMenu');

	// Remove glow from top and bottom menu
	$('#topMenuPanel').classList.remove('menuWithGlow');

	// Hide the top menu
	let top_menu_panel = $('#topMenuPanel');
	let top_menu = $('#topMenu');
	let style = top_menu.style;
	let height = top_menu_panel.offsetHeight + 15;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, -' + height + 'px, 0px)';

	g_top_menu_visible = 0.0;
	$('#wallPaper').style.opacity = 1.0;
}

function hideBottomMenu(is_instant) {
	let speed = is_instant ? '0.0s' : '0.3s';

	// Remove glow from top and bottom menu
	let bottom_menu_panel = $('#bottomMenuPanel');
	bottom_menu_panel.classList.remove('menuWithGlow');

	// Hide the bottom menu
	bottom_menu_panel.innerHTML = '';
	let height = bottom_menu_panel.offsetHeight;
	let bottom = $('#bottomMenu');
	bottom.style.transitionDuration = speed;
	bottom.style.transform = 'translate3d(0px, ' + height + 'px, 0px)';

	g_are_page_previews_loading = false;
	g_bottom_menu_visible = 0.0;
	$('#wallPaper').style.opacity = 1.0;
}

function setWallPaperOpacity() {
	let visible = 0;
	if (g_top_menu_visible > g_bottom_menu_visible) {
		visible = g_top_menu_visible;
	} else {
		visible = g_bottom_menu_visible;
	}
	$('#wallPaper').style.opacity = 1.0 - (0.9 * visible);
}

function showTopMenu(y_offset, is_instant) {
	// Move the top menu
	let speed = is_instant ? '0.0s' : '0.1s';
	let height = $('#topMenu').offsetHeight * 1.0;
	let offset = (-height + (height * y_offset)) - 15;
	let style = $('#topMenu').style;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, ' + offset + 'px, 0px)';
	g_top_menu_visible = y_offset;

	// Show the wall paper
	setWallPaperOpacity();
	$('#topMenuPanel').classList.add('menuWithGlow');
}

function loadPagePreview() {
	if (! g_are_page_previews_loading && g_bottom_menu_visible === 1.0) {
		//console.info('Loading page previews .....................');
		g_are_page_previews_loading = true;
		let menu = $('#bottomMenuPanel');
		menu.innerHTML = '';

		let curr_image_index = g_image_index;
		let length = Object.keys(g_titles).length;
		let loadNextPagePreview = function(i) {
			if (i >= length) {
				// Scroll to the current page
				let selected = document.querySelector('.comicPreviewBoxSelected');
				selected.scrollIntoView({block: "start", behavior: "smooth"});
				return;
			}

			let file_name = g_titles[i];
			getCachedFile('small', file_name, function(blob) {
				//console.info('Loading page preview #' + (i + 1));
				let url = null;
				if (blob) {
					url = URL.createObjectURL(blob);
					//console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
				}

				let img = document.createElement('img');
				img.className = 'comicPreviewPortrait';
				img.title = g_titles[i];
				img.onclick = function(e) {
					$('#comicPanel').scrollLeft = i * g_screen_width;
					hideAllMenus(false);
					let old_i = g_image_index;
					g_image_index = i;
					overlayShow();

					// Unload the previous images
					$('#page_' + old_i).src = '';
					if (old_i < g_image_count - 1) $('#page_' + (old_i+1)).src = '';
					if (old_i > 0) $('#page_' + (old_i-1)).src = '';

					// Load the big page images
					//console.info('load', i);
					let img = $('#page_' + i);
					img.src = img.src_big;
					if (i < g_image_count - 1) {
						img = $('#page_' + (i+1));
						img.src = img.src_big;
					}
					if (i > 0) {
						img = $('#page_' + (i-1));
						img.src = img.src_big;
					}
				};

				// The image loads successfully
				img.onload = function() {
					if (url) {
						URL.revokeObjectURL(url);
						//console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
					}

					// Make the image twice as wide if it is in landscape mode
					if (this.naturalWidth > this.naturalHeight) {
						this.className = 'comicPreviewLandscape';
					}
					loadNextPagePreview(i + 1);
				};
				// The image fails to load
				img.onerror = function() {
					if (url) {
						URL.revokeObjectURL(url);
						//console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
					}

					img.onload = null;
					img.onerror = null;
					img.src = 'invalid_image.png';

					loadNextPagePreview(i + 1);
				};

				if (url) {
					img.src = url;
				} else {
					img.src ='invalid_image.png';
				}

				let container = document.createElement('div');
				if (i === curr_image_index) {
					container.className = 'comicPreviewBox comicPreviewBoxSelected';
				} else {
					container.className = 'comicPreviewBox';
				}
				let caption = document.createElement('span');
				caption.innerHTML = i + 1;
				container.appendChild(img);
				container.appendChild(document.createElement('br'));
				container.appendChild(caption);
				menu.appendChild(container);
			});
		};

		loadNextPagePreview(0);
	} else {
		// Scroll to the current page
		let selected = document.querySelector('.comicPreviewBoxSelected');
		selected.scrollIntoView({block: "start", behavior: "smooth"});
	}
}

function showLibrary() {
	hide('#settingsMenu');
	hide('#bottomMenu');

	let libraryMenu = $('#libraryMenu');
	libraryMenu.innerHTML = '';
	let is_visible = libraryMenu.style.display !== 'none';
	if (is_visible) {
		libraryMenu.style.display = 'none';
		return;
	} else {
		libraryMenu.style.display = '';
	}

	let onStart = function(count) {
		if (count === 0) {
			libraryMenu.innerHTML = 'Library is empty';
		}
	};
	let onEach = function(filename, pagename, blob) {
		let container = document.createElement('div');
		container.className = 'comicPreviewBox';

		let img = new Image();
		img.title = filename;
		img.className = 'comicPreviewPortrait';

		if (pagename && blob) {
			let url = URL.createObjectURL(blob);
			//console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
			//console.info(pagename);
			container.onclick = function(e) {
				this.classList.add('comicPreviewBoxSelected');
				libraryMenu.style.display = 'none';
				libraryMenu.innerHTML = '';
				show('#bottomMenu');

				onLoaded(null, filename);
			};
			img.onload = function() {
				URL.revokeObjectURL(this.src);
				//console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + this.src);

				// Make the image twice as wide if it is in landscape mode
				if (this.naturalWidth > this.naturalHeight) {
					this.className = 'comicPreviewLandscape';
				}
			};
			img.onerror = function() {
				URL.revokeObjectURL(this.src);
				//console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + this.src);
			};
			img.src = url;
		} else {
			container.onclick = function(e) {
				this.classList.add('comicPreviewBoxSelected');
				libraryMenu.style.display = 'none';
				libraryMenu.innerHTML = '';
				show('#bottomMenu');

				onLoaded(null, filename);
			};
			img.src = 'invalid_image.png';
		}

		container.appendChild(img);
		libraryMenu.appendChild(container);

		if (filename === g_file_name) {
			container.classList.add('comicPreviewBoxSelected');
			container.scrollIntoView({block: "start", behavior: "smooth"});
		}
	};
	getAllCachedFirstPages(onStart, onEach);
}

function loadComic() {
	// Just return if there is no file selected
	let file_input = $('#fileInput');
	if (file_input.files.length === 0) {
		return;
	}

	// Get the file's info
	let file = file_input.files[0];
	let filename = file.name;

	onLoaded(file, filename);
}

function friendlyPageNumber() {
	return '(' + (g_image_index + 1) + ' of ' + g_image_count + ')';
}

function loadImage(page, index, cb) {
	let filename = g_titles[index];

	// Just return if there is no index
	if (! filename) {
		console.info('!!!!!!!!!!!!!!! Missing url for index:' + index);
		return;
	}

	page.innerHTML = '';

	let img = document.createElement('img');
	img.id = 'page_' + index;
	img.className = 'comicPage unselectable';
	img.alt = '';
	img.ondragstart = function() { return false; };
	img.draggable = false;
	img.onload = function() {
		img.onload = null;
		img.onerror = null;

		cb(index);
	};
	img.onerror = function() {
		img.onload = null;
		img.onerror = null;

		img.alt = 'Invalid Image';
		img.src = 'invalid_image.png';
		cb(index);
	};

	getCachedFile('big', filename, function(blob) {
		if (blob) {
			img.src_big = URL.createObjectURL(blob);
			console.info('    ' + img.src_big);
		}
		getCachedFile('small', filename, function(blob) {
			if (blob) {
				img.src_small = URL.createObjectURL(blob);
				console.info('    ' + img.src_small);
			}

			if (index <= 1) {
				console.info('load', index);
				img.src = img.src_big;
			}
			page.appendChild(img);
		});
	});
}

function setComicData(name) {
	g_file_name = name;
	$('#nameValue').textContent = name;
}

function clearComicData() {
	// Reset the UI
	document.title = 'Comic Book Reader';
	hide('#loadError');
	setComicData('');
	$('#bottomMenuPanel').innerHTML = '';
	$('#horizontalScroller').innerHTML = '';
	$('#comicPanel').scrollLeft = 0;

	// Close the connection to indexedDB
	dbClose();

	// Remove all the old images, compressed file entries, and object urls
	g_image_index = 0;
	g_image_count = 0;
	g_titles = {};
	g_are_page_previews_loading = false;
}

function onLoaded(blob, filename) {
	document.body.style.backgroundColor = 'black';

	// Clear everything
	$('#btnFileLoad').disabled = true;
	$('#btnLibrary').disabled = true;
	$('#btnSettings').disabled = true;
	hideAllMenus(false);
	clearComicData();
	setComicData(filename);

	// Read the file
	show('#comicPanel');

	// Get the names of all the cached comics
	g_use_higher_quality_previews = settings_get_use_higher_quality_previews();
	loader_load_file(blob, filename);
}

function onError(msg) {
	hide('#comicPanel');
	setComicData('');
	$('#loadError').textContent = 'Error: ' + msg;
	show('#loadError');
	showTopMenu(1.0, true);

	$('#btnFileLoad').disabled = false;
	$('#btnLibrary').disabled = false;
	$('#btnSettings').disabled = false;
}

function onResize() {
	g_screen_width = window.innerWidth;
	g_screen_height = window.innerHeight;
	//console.info(g_screen_width);

	let new_left = g_image_index * g_screen_width;
	$('#comicPanel').scrollLeft = new_left;

	let height = $('#topMenuPanel').offsetHeight;
	let new_y = - (height - (g_top_menu_visible * height));
	let top = $('#topMenu');
	top.style.transitionDuration = '0.0s';
	top.style.transform = 'translate3d(0px, ' + new_y + 'px, 0px)';

	if (g_bottom_menu_visible > 0) {
		let bottom = $('#bottomMenu');
		bottom.style.transitionDuration = '0.0s';
		bottom.style.transform = 'translate3d(0px, 0px, 0px)';
	} else {
		let height = $('#bottomMenuPanel').offsetHeight;
		let new_y = height - (g_bottom_menu_visible * height);
		let bottom = $('#bottomMenu');
		bottom.style.transitionDuration = '0.0s';
		bottom.style.transform = 'translate3d(0px, ' + new_y + 'px, 0px)';
	}
}

function overlayShow() {
	// Update the page number
	let number = friendlyPageNumber();
	$('#overlayPageNumber').innerHTML = number;
	document.title = number + ' "' + g_file_name + '"';

	// Restart the animation
	let overlay = $('#overlayPageNumber');
	overlay.style.display = '';
	animateCSS(overlay, "opacity: 0.5", "opacity: 0.0", "5600ms",
	function() {
		overlay.style.display = 'none';
	});
}

function monitorTotalUsersOnline() {
	console.info("Getting total users online ...");
	let update_timeout = 1000 * 60 * 5; // 5 minutes
	let user_id = settings_get_user_id();
	let url = "//comic-book-reader.com/server/count.php?id=" + user_id;

	httpGet(url, function(data, status) {
		if (data && status === 200) {
			$('#totalUsersOnline').textContent = "Total users online: " + parseInt(data);
		} else {
			console.info(data);
			console.info(status);
		}
	});
	setTimeout(monitorTotalUsersOnline, update_timeout);
}

function onStorageFull(filename) {
	if (g_is_terminated) {
		return;
	}

	// Terminate the worker
	g_is_terminated = true;
	killWorker();

	// Close the connection to the database
	dbClose();

	// Reload the page with a "storage is full" message
	localStorage.setItem('storage_is_full', JSON.stringify(true));
	window.location.reload();
}

function onKeyDown(event) {
	let code = event.keyCode || event.which;
	//console.info(code);

	let comic_panel = null;
	let i = -1;
	let vertical_scroller = null;

	switch (code) {
		// F11: Toggle full screen
		case 122:
			event.preventDefault();
			toggleFullScreen();
			break;
		// Left: Move to previous page
		case 37:
			onChangePage(false);
			break;
		// Right: Move to next page
		case 39:
			onChangePage(true);
			break;
		// Up: Scroll up
		case 38:
			comic_panel = $('#comicPanel');
			i = Math.round(comic_panel.scrollLeft / g_screen_width);
			vertical_scroller = $('#horizontalScroller').children[i];
			vertical_scroller.scrollTop -= 20;
			break;
		// Down: Scroll down
		case 40:
			comic_panel = $('#comicPanel');
			i = Math.round(comic_panel.scrollLeft / g_screen_width);
			vertical_scroller = $('#horizontalScroller').children[i];
			vertical_scroller.scrollTop += 20;
			break;
	}
}

function onMouseClick(e) {
	// Detect left clicks only
	if (g_top_menu_visible === 1.0 || g_bottom_menu_visible === 1.0) {
		hideAllMenus(false);
		return;
	}

	let comic_panel = $('#comicPanel');
	// Get the current page
	let x = e.clientX;
	let y = e.clientY;

	// Open top menu
	if (y < 200) {
		showTopMenu(1.0, false);
	// Open bottom menu
	} else if (y > (g_screen_height - 200)) {
		// FIXME: Make this a showBottomMenu function
		let bottom = $('#bottomMenu');
		bottom.style.transitionDuration = '0.3s';
		bottom.style.transform = 'translate3d(0px, 0px, 0px)';
		g_bottom_menu_visible = 1.0;
		setWallPaperOpacity();
		$('#bottomMenuPanel').classList.add('menuWithGlow');
		loadPagePreview();
	// Move page right or left
	} else {
		// Figure out if the click was on the right or left
		let is_right = (x > (g_screen_width / 2));
		onChangePage(is_right);
	}
}

function onChangePage(is_right) {
	let comic_panel = $('#comicPanel');
	let i = Math.round(comic_panel.scrollLeft / g_screen_width);

	// Next page
	let old_i = -1;
	if (is_right) {
		if (i < g_image_count - 1) i++;
		if (i >= 2) old_i = i - 2;
	// Prev page
	} else {
		if (i > 0) i--;
		if (i <= g_image_count - 2) old_i = i + 2;
	}

	// Scroll the page into position
	let new_left = i * g_screen_width;
	g_image_index = i;
	overlayShow();

	// Animate the scroll bar
	animateValue(function(trans_value) {
		comic_panel.scrollLeft = trans_value;

		// The scroll bar is done moving
		if (trans_value === new_left) {
			// Unload the previous image
			if (old_i !== -1 && i !== old_i) {
				console.info('unload', old_i);
				let img = $('#page_' + old_i);
				img.src = '';
			}
			// Load the right page
			if (i < g_image_count - 1) {
				console.info('load', i+1);
				let img = $('#page_' + (i+1));
				img.src = img.src_big;
			}
			// Load the left page
			if (i > 0) {
				console.info('load', i-1);
				let img = $('#page_' + (i-1));
				img.src = img.src_big;
			}
		}
	}, comic_panel.scrollLeft, new_left, 600);
}

function main() {
	// Show the welcome screen if this is the first run
	if (settings_get_is_first_run()) {
		show('#welcomeScreen');
	// Otherwise show the touch UI
	} else {
		show('#mainUI');
		hideBottomMenu(true);
		showTopMenu(true);
	}

	$('#btnInputTouch').addEventListener('click', function () {
		hide('#welcomeScreen');
		show('#mainUI');
		hideBottomMenu(true);
		showTopMenu(true);
		settings_set_is_first_run(false);
	});
/*
	window.onerror = function(messageOrEvent, source, lineno, colno, error) {
		console.error('Error!');
		console.error(messageOrEvent);
		console.error(source + ' (' + lineno + ', ' + colno + ')');
		console.error(error);
	};
*/
	// Stop the right click menu from popping up
	document.addEventListener('contextmenu', function(e) {
		if (! settings_get_right_click_enabled()) {
			e.preventDefault();
		}
	});

	// Resize everything when the browser resizes
	window.addEventListener('resize', function() {
		let width = window.innerWidth;
		let height = window.innerHeight;
		onResize(width, height);
	});

	// Toggle full screen
	$('#btnFullScreen').addEventListener('click', function () {
		toggleFullScreen();
	});

	// Open github in a new tab
	$('#btnHomepage').addEventListener('click', function () {
		let url = "https://github.com/workhorsy/comic_book_reader";
		window.open(url, '_blank');
	});

	// Show the settings menu
	$('#btnSettings').addEventListener('click', function () {
		hide('#libraryMenu');
		$('#libraryMenu').innerHTML = '';

		let is_visible = $('#settingsMenu').style.display !== 'none';
		if (is_visible) {
			hide('#settingsMenu');
			show('#bottomMenu');
		} else {
			// Update the DB size
			$('#totalDBSize').textContent = '. . .';
			getTotalSize(function(length) {
				$('#totalDBSize').textContent = toFriendlySize(length);
			});

			// Show the menu
			show('#settingsMenu');
			hide('#bottomMenu');
		}
	});

	// Right click toggle
	$('#btnDisableRightClick').checked = settings_get_right_click_enabled();
	$('#btnDisableRightClick').addEventListener('click', function() {
		let value = settings_get_right_click_enabled();
		settings_set_right_click_enabled(! value);
		$('#btnDisableRightClick').checked = ! value;
	});

	$('#btnEnableInstallUpdates').checked = settings_get_install_updates_enabled();
	$('#btnEnableInstallUpdates').addEventListener('click', function() {
		let value = settings_get_install_updates_enabled();
		settings_set_install_updates_enabled(! value);
		$('#btnEnableInstallUpdates').checked = ! value;
	});

	$('#btnUseHigherQualityPreviews').checked = settings_get_use_higher_quality_previews();
	$('#btnUseHigherQualityPreviews').addEventListener('click', function() {
		let value = settings_get_use_higher_quality_previews();
		settings_set_use_higher_quality_previews(! value);
		$('#btnUseHigherQualityPreviews').checked = ! value;
	});

	let g_image_smooth_style = null;
	$('#btnUseSmoothingWhenResizingImages').checked = settings_get_use_smoothing_when_resizing_images();
	$('#btnUseSmoothingWhenResizingImages').addEventListener('click', function() {
		let value = settings_get_use_smoothing_when_resizing_images();
		settings_set_use_smoothing_when_resizing_images(! value);

		if (g_image_smooth_style === null) {
			g_image_smooth_style = document.createElement('style');
			g_image_smooth_style.type = 'text/css';
			g_image_smooth_style.innerHTML = "\
			img {\r\n\
				image-rendering: optimizeSpeed;\r\n\
				image-rendering: -moz-crisp-edges;\r\n\
				image-rendering: -o-crisp-edges;\r\n\
				image-rendering: -webkit-optimize-contrast;\r\n\
				image-rendering: pixelated;\r\n\
				image-rendering: optimize-contrast;\r\n\
				-ms-interpolation-mode: nearest-neighbor;\r\n\
			}";
			$('head')[0].appendChild(g_image_smooth_style);
		} else {
			$('head')[0].removeChild(g_image_smooth_style);
			g_image_smooth_style = null;
		}
	});

	// Delete indexedDB and localStorage data
	$('#btnClearAllData').addEventListener('click', function() {
		let db_names = settings_get_db_names();

		clearComicData();

		function deleteNextDB() {
			if (db_names.length > 0) {
				let db_name = db_names.pop();
				deleteCachedFileStorage(db_name, function() {
					deleteNextDB();
				});
			} else {
				settings_delete_all();
				$('#btnDisableRightClick').checked = settings_get_right_click_enabled();
				$('#btnEnableInstallUpdates').checked = settings_get_install_updates_enabled();
				$('#btnUseHigherQualityPreviews').checked = settings_get_use_higher_quality_previews();
				$('#btnUseSmoothingWhenResizingImages').checked = settings_get_use_smoothing_when_resizing_images();

				$('#totalDBSize').textContent = '. . .';
				getTotalSize(function(length) {
					$('#totalDBSize').textContent = toFriendlySize(length);
					alert('Done clearing all data');
				});
			}
		}
		deleteNextDB();
	});

	$('#btnLibrary').addEventListener('click', function() {
		showLibrary();
	});

	// Open the file selection box
	$('#btnFileLoad').addEventListener('click', function() {
		$('#fileInput').click();
	});

	// Load the selected file
	$('#fileInput').addEventListener('change', function() {
		loadComic();
	});

	// Key events
	document.addEventListener('keydown', onKeyDown, false);

	// Mouse events for the page container
	let comic_panel = $('#comicPanel');
	comic_panel.addEventListener('click', onMouseClick, false);

	// Reset everything
	hide('#comicPanel');

	// Fire the resize event
	try {
		// Firefox/Chrome
		let event = new Event('resize');
		window.dispatchEvent(event);
	} catch (e) {
		// IE 11
		let event = document.createEvent('HTMLEvents');
		event.initEvent('resize', false, true);
		window.dispatchEvent(event);
	}

	clearComicData();
	$('#btnFileLoad').disabled = false;
	$('#btnLibrary').disabled = false;
	$('#btnSettings').disabled = false;

	// Warn the user if indexedDB is full
	let storage_is_full = localStorage.getItem('storage_is_full');
	if (storage_is_full && JSON.parse(storage_is_full)) {
		localStorage.removeItem('storage_is_full');
		alert('Storage is full! Remove data from indexedDB, or free up disk space.');
	}

	// FIXME: Check if indexedDB is full

	startWorker();
	$('#versionDate').textContent = getVersionDate();
	monitorTotalUsersOnline();
}

documentOnReady(function() {
	hide('#welcomeScreen');
	hide('#settingsMenu');
	hide('#libraryMenu');

	// Show an error message if any required browser features are missing
	requireBrowserFeatures(function() {
		// Start the service worker
		if (g_use_service_worker && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('service_worker.js', { scope: '/' }).then(function(reg) {
				if (reg.installing) {
					console.log('Service worker installing');
				} else if (reg.waiting) {
					console.log('Service worker installed');
				} else if (reg.active) {
					console.log('Service worker active');
				}

				show('#btnCheckForUpdatesNow');
				$('#btnCheckForUpdatesNow').addEventListener('click', function() {
					reg.update();

					window.caches.keys().then(function(cacheNames) {
						return Promise.all(
							cacheNames.map(function(cacheName) {
								console.log('Deleting cache:', cacheName);
								return window.caches.delete(cacheName);
							})
						).then(function() {
							console.log('Caches deleted.');
							location.reload();
						});
					});
				});

				main();
			}).catch(function(error) {
				console.error('Failed to register service worker: ' + error);
			});
		} else {
			console.info('Service workers are not supported ...');
			main();
		}
	});
});
