// Copyright (c) 2016 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

var g_is_terminated = false;
var g_worker = null;
var g_file_name = null;
var g_image_index = 0;
var g_image_count = 0;
var g_titles = {};
var g_are_page_previews_loading = false;
var g_use_higher_quality_previews = false;
var g_screen_width = 0;
var g_screen_height = 0;
var g_top_menu_visible = 1.0;
var g_bottom_menu_visible = 0.0;

function requireBrowserFeatures(cb) {
	var errors = [];
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
			var message = '<div class="errors">';
			message += '<h1>Your browser is missing features required to run this program:</h1>';
			for (var i=0; i<errors.length; ++i) {
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
		var worker = new Worker('js/test_requirements_worker.js');
		worker.onmessage = function(e) {
			if (e.data.action === 'test_requirements') {
				var errors = e.data.errors;
				if (! hasErrors(errors)) {
					// Test Web Workers for transferable objects
					var array_buffer = new ArrayBuffer(1);
					var message = {
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

		var message = {
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
	var speed = is_instant ? '0.0s' : '0.3s';

	// Hide the top menus
	hide('#settingsMenu');
	hide('#tutorialMenu');
	hide('#libraryMenu');
	$('#libraryMenu').innerHTML = '';
	show('#bottomMenu');

	// Remove glow from top and bottom menu
	$('#topMenuPanel').classList.remove('menuWithGlow');

	// Hide the top menu
	var top_menu_panel = $('#topMenuPanel');
	var top_menu = $('#topMenu');
	var style = top_menu.style;
	var height = top_menu_panel.offsetHeight + 15;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, -' + height + 'px, 0px)';

	g_top_menu_visible = 0.0;
	$('#wallPaper').style.opacity = 1.0;
}

function hideBottomMenu(is_instant) {
	var speed = is_instant ? '0.0s' : '0.3s';

	// Remove glow from top and bottom menu
	var bottom_menu_panel = $('#bottomMenuPanel');
	bottom_menu_panel.classList.remove('menuWithGlow');

	// Hide the bottom menu
	bottom_menu_panel.innerHTML = '';
	var height = bottom_menu_panel.offsetHeight;
	var bottom = $('#bottomMenu');
	bottom.style.transitionDuration = speed;
	bottom.style.transform = 'translate3d(0px, ' + height + 'px, 0px)';

	g_are_page_previews_loading = false;
	g_bottom_menu_visible = 0.0;
	$('#wallPaper').style.opacity = 1.0;
}

function setWallPaperOpacity() {
	var visible = 0;
	if (g_top_menu_visible > g_bottom_menu_visible) {
		visible = g_top_menu_visible;
	} else {
		visible = g_bottom_menu_visible;
	}
	$('#wallPaper').style.opacity = 1.0 - (0.9 * visible);
}

function showTopMenu(y_offset, is_instant) {
	// Move the top menu
	var speed = is_instant ? '0.0s' : '0.1s';
	var height = $('#topMenu').offsetHeight * 1.0;
	var offset = (-height + (height * y_offset)) - 15;
	var style = $('#topMenu').style;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, ' + offset + 'px, 0px)';
	g_top_menu_visible = y_offset;

	// Show the wall paper
	setWallPaperOpacity();
	$('#topMenuPanel').classList.add('menuWithGlow');
}

function loadPagePreview() {
	if (! g_are_page_previews_loading && g_bottom_menu_visible === 1.0) {
		console.info('Loading page previews .....................');
		g_are_page_previews_loading = true;
		var menu = $('#bottomMenuPanel');
		menu.innerHTML = '';

		var curr_image_index = g_image_index;
		var length = Object.keys(g_titles).length;
		var loadNextPagePreview = function(i) {
			if (i >= length) {
				return;
			}

			var file_name = g_titles[i];
			getCachedFile('small', file_name, function(blob) {
				//console.info('Loading page preview #' + (i + 1));
				var url = null;
				if (blob) {
					url = URL.createObjectURL(blob);
					//console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
				}

				var img = document.createElement('img');
				img.className = 'comicPreviewPortrait';
				img.title = g_titles[i];
				img.onclick = function(e) {
					console.info(i * g_screen_width);
					$('#comicPanel').scrollLeft = i * g_screen_width;
					hideAllMenus(false);
					var old_i = g_image_index;
					g_image_index = i;
					overlayShow();

					// Unload the previous images
					$('#page_' + old_i).src = '';
					if (old_i < g_image_count - 1) $('#page_' + (old_i+1)).src = '';
					if (old_i > 0) $('#page_' + (old_i-1)).src = '';

					// Load the big page images
					console.info('load', i);
					var img = $('#page_' + i);
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
					img.src ='invalid_image.png'
				}

				var container = document.createElement('div');
				if (i === curr_image_index) {
					container.className = 'comicPreviewBox comicPreviewBoxSelected';
				} else {
					container.className = 'comicPreviewBox';
				}
				var caption = document.createElement('span');
				caption.innerHTML = i + 1;
				container.appendChild(img);
				container.appendChild(document.createElement('br'));
				container.appendChild(caption);
				menu.appendChild(container);
			});
		};

		loadNextPagePreview(0);
	}
}

function showLibrary() {
	hide('#settingsMenu');
	hide('#tutorialMenu');
	hide('#bottomMenu');

	var libraryMenu = $('#libraryMenu');
	libraryMenu.innerHTML = '';
	var is_visible = libraryMenu.style.display != 'none';
	if (is_visible) {
		libraryMenu.style.display = 'none';
		return;
	} else {
		libraryMenu.style.display = '';
	}

	var onStart = function(count) {
		if (count === 0) {
			libraryMenu.innerHTML = 'Library is empty';
		}
	};
	var onEach = function(filename, pagename, blob) {
		var img = new Image();
		img.title = filename;
		img.className = 'comicPreviewPortrait';

		if (pagename && blob) {
			var url = URL.createObjectURL(blob);
			//console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
			//console.info(pagename);
			img.onclick = function(e) {
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
			img.onclick = function(e) {
				libraryMenu.style.display = 'none';
				libraryMenu.innerHTML = '';
				show('#bottomMenu');

				onLoaded(null, filename);
			};
			img.src = 'invalid_image.png';
		}

		libraryMenu.appendChild(img);
	};
	getAllCachedFirstPages(onStart, onEach);
}

function showTutorial() {
	hide('#settingsMenu');
	hide('#libraryMenu');
	$('#libraryMenu').innerHTML = '';
	hide('#bottomMenu');

	var tutorialMenu = $('#tutorialMenu');
	var is_visible = tutorialMenu.style.display != 'none';
	if (is_visible) {
		tutorialMenu.style.display = 'none';
		return;
	} else {
		tutorialMenu.style.display = '';
	}
}

function loadComic() {
	// Just return if there is no file selected
	var file_input = $('#fileInput');
	if (file_input.files.length === 0) {
		return;
	}

	// Get the file's info
	var file = file_input.files[0];
	var filename = file.name;

	onLoaded(file, filename);
}

function friendlyPageNumber() {
	return '(' + (g_image_index + 1) + ' of ' + g_image_count + ')';
}

function loadImage(page, index, cb) {
	var filename = g_titles[index];

	// Just return if there is no index
	if (! filename) {
		console.info('!!!!!!!!!!!!!!! Missing url for index:' + index);
		return;
	}

	page.innerHTML = '';

	var img = document.createElement('img');
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
	var db_names = settings_get_db_names();
	var has_file = db_names.includes(filename);

	// If the file is cached, load it from the cache
	if (has_file) {
		initCachedFileStorage(filename, function() {
			var message = {
				action: 'load_from_cache',
				filename: filename
			};
			g_worker.postMessage(message);
		});
	// If the file is not cached, send it to the worker to be decompressed
	} else {
		// Save the name of the comic to the cache
		initCachedFileStorage(filename, function() {
			var db_names = settings_get_db_names();
			if (! db_names.includes(filename)) {
				db_names.push(filename);
				settings_set_db_names(db_names);
			}
			g_worker.postMessage(blob);
		});
	}
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

	var new_left = g_image_index * g_screen_width;
	$('#comicPanel').scrollLeft = new_left;

	var height = $('#topMenuPanel').offsetHeight;
	var new_y = - (height - (g_top_menu_visible * height));
	var top = $('#topMenu');
	top.style.transitionDuration = '0.0s';
	top.style.transform = 'translate3d(0px, ' + new_y + 'px, 0px)';

	if (g_bottom_menu_visible > 0) {
		var bottom = $('#bottomMenu');
		bottom.style.transitionDuration = '0.0s';
		bottom.style.transform = 'translate3d(0px, 0px, 0px)';
	} else {
		var height = $('#bottomMenuPanel').offsetHeight;
		var new_y = height - (g_bottom_menu_visible * height);
		var bottom = $('#bottomMenu');
		bottom.style.transitionDuration = '0.0s';
		bottom.style.transform = 'translate3d(0px, ' + new_y + 'px, 0px)';
	}
}

function overlayShow() {
	// Update the page number
	var number = friendlyPageNumber();
	$('#overlayPageNumber').innerHTML = number;
	document.title = number + ' "' + g_file_name + '"';

	// Restart the animation
	var overlay = $('#overlayPageNumber');
	overlay.style.display = '';
	animateCSS(overlay, "opacity: 0.5", "opacity: 0.0", "5600ms",
	function() {
		overlay.style.display = 'none';
	});
}

function monitorTotalUsersOnline() {
	console.info("Getting total users online ...");
	var update_timeout = 1000 * 60 * 5; // 5 minutes
	var user_id = settings_get_user_id();
	var url = "http://comic-book-reader.com/server/count.php?id=" + user_id;

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
	if (g_worker) {
		g_worker.terminate();
		g_worker = null;
	}

	// Close the connection to the database
	dbClose();

	// Reload the page with a "storage is full" message
	localStorage.setItem('storage_is_full', JSON.stringify(true));
	window.location.reload();
}

function startWorker() {
	g_worker = new Worker('js/worker.js');

	g_worker.onmessage = function(e) {
		if (g_is_terminated) {
			return;
		}

		switch (e.data.action) {
			case 'storage_full':
				var filename = e.data.filename;
				onStorageFull(filename);
				break;
			case 'uncompressed_start':
				// Update the progress
				g_image_count =  e.data.count;
				$('#loadingProgress').innerHTML = 'Loading 0.0% ...';
				show('#loadingProgress');
				break;
			case 'uncompressed_done':
				$('#comicPanel').scrollLeft = 0;
				overlayShow();
				break;
			case 'uncompressed_each':
				var filename = e.data.filename;
				var index = e.data.index;
				var is_cached = e.data.is_cached;
				var is_last = e.data.is_last;

				g_titles[index] = filename;

				$('#loadingProgress').innerHTML = 'Loading ' + ((index / (g_image_count - 1)) * 100.0).toFixed(1) + '% ...';

				makePagePreview(filename, is_cached, function() {
					var container = $('#horizontalScroller');
					var page = document.createElement('div');
					page.className = 'verticalScroller unselectable';
					container.appendChild(page);

					loadImage(page, index, function() {
						//
					});

					if (is_last) {
						stopWorker();

						hide('#loadingProgress');
						$('#loadingProgress').innerHTML = '';
						$('#btnFileLoad').disabled = false;
						$('#btnLibrary').disabled = false;
						$('#btnSettings').disabled = false;

						startWorker();
					}
				});
				break;
			case 'invalid_file':
				var filename = e.data.filename;

				dbClose();

				// Remove the file db
				deleteCachedFileStorage(filename, function() {

				});

				// Remove the file name from list of dbs
				var db_names = settings_get_db_names();
				var index = db_names.indexOf(filename);
				if (index !== -1) {
					db_names.splice(index, 1);
					settings_set_db_names(db_names);
				}

				onError(e.data.error);
				break;
		}
	};

	// Start the worker
	var message = {
		action: 'start'
	};
	g_worker.postMessage(message);

}

function stopWorker() {
	var message = {
		action: 'stop'
	};
	g_worker.postMessage(message);
	g_worker = null;
}

function makePagePreview(filename, is_cached, cb) {
	if (! is_cached) {
		getCachedFile('big', filename, function(blob) {
			var url = URL.createObjectURL(blob);
			//console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url + ', ' + filename);

			var img = new Image();
			img.onload = function() {
				if (url) {
					URL.revokeObjectURL(url);
					//console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
					url = null;
				}

				var ratio = 400.0 / img.width;
				var width = img.width * ratio;
				var height = img.height * ratio;

				resizeImage(img, width, height, g_use_higher_quality_previews, function(small_blob) {
					img.src = '';
					setCachedFile('small', filename, small_blob, function(is_success) {
						if (! is_success) {
							onStorageFull(filename);
						}
						if (cb) {
							cb();
							cb = null;
						}
					});
				});
			};
			img.onerror = function(e) {
				if (url) {
					URL.revokeObjectURL(url);
					//console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
					url = null;
				}

				if (cb) {
					cb();
					cb = null;
				}
			};
			img.src = url;
		});
	} else {
		if (cb) {
			cb();
			cb = null;
		}
	}
}

function onKeyDown(event) {
	var code = event.keyCode || event.which;
	//console.info(code);

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
			var comic_panel = $('#comicPanel');
			var i = Math.round(comic_panel.scrollLeft / g_screen_width);
			var vertical_scroller = $('#horizontalScroller').children[i];
			vertical_scroller.scrollTop -= 20;
			break;
		// Down: Scroll down
		case 40:
			var comic_panel = $('#comicPanel');
			var i = Math.round(comic_panel.scrollLeft / g_screen_width);
			var vertical_scroller = $('#horizontalScroller').children[i];
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

	var comic_panel = $('#comicPanel');
	// Get the current page
	var x = e.clientX;
	var y = e.clientY;

	// Open top menu
	if (y < 200) {
		showTopMenu(1.0, false);
	// Open bottom menu
	} else if (y > (g_screen_height - 200)) {
		// FIXME: Make this a showBottomMenu function
		var bottom = $('#bottomMenu');
		bottom.style.transitionDuration = '0.3s';
		bottom.style.transform = 'translate3d(0px, 0px, 0px)';
		g_bottom_menu_visible = 1.0;
		setWallPaperOpacity();
		$('#bottomMenuPanel').classList.add('menuWithGlow');
		loadPagePreview();
	// Move page right or left
	} else {
		// Figure out if the click was on the right or left
		var is_right = (x > (g_screen_width / 2));
		onChangePage(is_right);
	}
}

function onChangePage(is_right) {
	var comic_panel = $('#comicPanel');
	var i = Math.round(comic_panel.scrollLeft / g_screen_width);

	// Next page
	var old_i = -1;
	if (is_right) {
		if (i < g_image_count - 1) i++;
		if (i >= 2) old_i = i - 2;
	// Prev page
	} else {
		if (i > 0) i--;
		if (i <= g_image_count - 2) old_i = i + 2;
	}

	// Scroll the page into position
	var new_left = i * g_screen_width;
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
				var img = $('#page_' + old_i);
				img.src = '';
			}
			// Load the right page
			if (i < g_image_count - 1) {
				console.info('load', i+1);
				var img = $('#page_' + (i+1));
				img.src = img.src_big;
			}
			// Load the left page
			if (i > 0) {
				console.info('load', i-1);
				var img = $('#page_' + (i-1));
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

	// Stop the right click menu from popping up
	document.addEventListener('contextmenu', function(e) {
		if (! settings_get_right_click_enabled()) {
			e.preventDefault();
		}
	});

	// Resize everything when the browser resizes
	window.addEventListener('resize', function() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		onResize(width, height);
	});

	// Toggle full screen
	$('#btnFullScreen').addEventListener('click', function () {
		toggleFullScreen();
	});

	// Open github in a new tab
	$('#btnHomepage').addEventListener('click', function () {
		var url = "https://github.com/workhorsy/comic_book_reader";
		window.open(url, '_blank');
	});

	// Show the settings menu
	$('#btnSettings').addEventListener('click', function () {
		hide('#libraryMenu');
		$('#libraryMenu').innerHTML = '';

		var is_visible = $('#settingsMenu').style.display != 'none';
		if (is_visible) {
			hide('#settingsMenu');
			hide('#tutorialMenu');
			show('#bottomMenu');
		} else {
			// Update the DB size
			$('#totalDBSize').textContent = '. . .';
			getTotalSize(function(length) {
				$('#totalDBSize').textContent = toFriendlySize(length);
			});

			// Show the menu
			show('#settingsMenu');
			hide('#tutorialMenu');
			hide('#bottomMenu');
		}
	});

	// Right click toggle
	$('#btnDisableRightClick').checked = settings_get_right_click_enabled();
	$('#btnDisableRightClick').addEventListener('click', function() {
		var value = settings_get_right_click_enabled();
		settings_set_right_click_enabled(! value);
		$('#btnDisableRightClick').checked = ! value;
	});

	$('#btnEnableInstallUpdates').checked = settings_get_install_updates_enabled();
	$('#btnEnableInstallUpdates').addEventListener('click', function() {
		var value = settings_get_install_updates_enabled();
		settings_set_install_updates_enabled(! value);
		$('#btnEnableInstallUpdates').checked = ! value;
	});

	$('#btnUseHigherQualityPreviews').checked = settings_get_use_higher_quality_previews();
	$('#btnUseHigherQualityPreviews').addEventListener('click', function() {
		var value = settings_get_use_higher_quality_previews();
		settings_set_use_higher_quality_previews(! value);
		$('#btnUseHigherQualityPreviews').checked = ! value;
	});

	var g_image_smooth_style = null;
	$('#btnUseSmoothingWhenResizingImages').checked = settings_get_use_smoothing_when_resizing_images();
	$('#btnUseSmoothingWhenResizingImages').addEventListener('click', function() {
		var value = settings_get_use_smoothing_when_resizing_images();
		settings_set_use_smoothing_when_resizing_images(! value);

		if (g_image_smooth_style == null) {
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
		var db_names = settings_get_db_names();

		clearComicData();

		function deleteNextDB() {
			if (db_names.length > 0) {
				var db_name = db_names.pop();
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
/*
	$('#btnCheckForUpdatesNow').addEventListener('click', function() {
	});
*/
	$('#btnLibrary').addEventListener('click', function() {
		showLibrary();
	});

	$('#btnTutorial').addEventListener('click', function() {
		showTutorial();
	});

	$('#btnTutorialNext').addEventListener('click', function() {
		// Get all the tutorial divs
		var tuts = [
			$('#tutorial_0'),
			$('#tutorial_1'),
			$('#tutorial_2'),
		];

		// Get the visible tutorial
		var j = 0;
		for (var i=0; i<tuts.length; ++i) {
			if (tuts[i].style.display !== 'none') {
				j = i;
				break;
			}
		}

		// Hide the old tutorial, and show the new tutorial
		tuts[j].style.display = 'none';
		j++;
		if (j >= tuts.length) {
			j = 0;
		}
		tuts[j].style.display = 'inline';
	});

	$('#btnTutorialPrev').addEventListener('click', function() {
		// Get all the tutorial divs
		var tuts = [
			$('#tutorial_0'),
			$('#tutorial_1'),
			$('#tutorial_2'),
		];

		// Get the visible tutorial
		var j = 0;
		for (var i=0; i<tuts.length; ++i) {
			if (tuts[i].style.display !== 'none') {
				j = i;
				break;
			}
		}

		// Hide the old tutorial, and show the new tutorial
		tuts[j].style.display = 'none';
		j--
		if (j < 0) {
			j = tuts.length - 1;
		}
		tuts[j].style.display = 'inline';
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
	var comic_panel = $('#comicPanel');
	comic_panel.addEventListener('click', onMouseClick, false);

	// Reset everything
	hide('#comicPanel');
	window.dispatchEvent(new Event('resize'));

	clearComicData();
	$('#btnFileLoad').disabled = false;
	$('#btnLibrary').disabled = false;
	$('#btnSettings').disabled = false;

	// Warn the user if indexedDB is full
	var storage_is_full = localStorage.getItem('storage_is_full');
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
	hide('#tutorialMenu');
	hide('#libraryMenu');

	// Show an error message if any required browser features are missing
	requireBrowserFeatures(function() {
		main();
	});
});
