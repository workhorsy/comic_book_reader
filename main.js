// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
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

var g_is_mouse_mode = false;
var g_is_mouse_down = false;
var g_mouse_start_x = 0;
var g_mouse_start_y = 0;

var g_screen_width = 0;
var g_screen_height = 0;
var g_page_width = 0;
var g_scroll_y_temp = 0;
var g_scroll_y_start = 0;
var g_needs_resize = false;

var g_down_swipe_size = 100.0;
var g_is_swiping_right = false;
var g_is_swiping_left = false;
var g_top_menu_visible = 1.0;
var g_bottom_menu_visible = 0.0;

var g_page_left = null;
var g_page_middle = null;
var g_page_right = null;


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
	if (typeof applicationCache === 'undefined') {
		errors.push('Application Cache');
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
			var message = '<h1>Your browser is missing features required to run this program:</h1>';
			for (var i=0; i<errors.length; ++i) {
				message += (errors[i] + ' is not supported!<br/>');
			}
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

function toFriendlySize(size) {
	if (size >= 1024000000) {
		return (size / 1024000000).toFixed(2) + ' GB';
	} else if (size >= 1024000) {
		return (size / 1024000).toFixed(2) + ' MB';
	} else if (size >= 1024) {
		return (size / 1024).toFixed(2) + ' KB';
	} else if (size >= 1) {
		return (size / 1).toFixed(2) + ' B';
	} else if (size === 0) {
		return 'None';
	}

	return '?';
}

function hideAllMenus(is_instant) {
	hideTopMenu(is_instant);
	hideBottomMenu(is_instant);
}

function hideTopMenu(is_instant) {
	var speed = is_instant ? '0.0s' : '0.3s';

	// Hide the top menus
	$('.settingsMenu').hide();
	$('#libraryMenu').hide();
	$('#libraryMenu').empty();

	// Remove glow from top and bottom menu
	$('#topMenu').removeClass('menuWithGlow');

	// Hide the top menu
	var top_menu = $('#topMenu');
	var style = top_menu[0].style;
	var height = top_menu.outerHeight() + 15;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, -' + height + 'px, 0px)';

	g_top_menu_visible = 0.0;
	$('#wallPaper')[0].style.opacity = 1.0;
}

function hideBottomMenu(is_instant) {
	var speed = is_instant ? '0.0s' : '0.3s';

	// Remove glow from top and bottom menu
	$('#bottomMenu').removeClass('menuWithGlow');

	// Hide the bottom menu
	var bottom_menu = $('#bottomMenu');
	bottom_menu.empty();
	var style = bottom_menu[0].style;
	var height = bottom_menu.outerHeight() + 10;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, ' + height + 'px, 0px)';

	g_are_page_previews_loading = false;
	g_bottom_menu_visible = 0.0;
	$('#wallPaper')[0].style.opacity = 1.0;
}

function setWallPaperOpacity() {
	var visible = 0;
	if (g_top_menu_visible > g_bottom_menu_visible) {
		visible = g_top_menu_visible;
	} else {
		visible = g_bottom_menu_visible;
	}
	$('#wallPaper')[0].style.opacity = 1.0 - (0.9 * visible);
}

function showTopMenu(y_offset, is_instant) {
	// Move the top menu
	var speed = is_instant ? '0.0s' : '0.1s';
	var height = $('#topMenu').outerHeight() * 1.0;
	var offset = (-height + (height * y_offset)) - 15;
	var style = $('#topMenu')[0].style;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, ' + offset + 'px, 0px)';
	g_top_menu_visible = y_offset;

	// Show the wall paper
	setWallPaperOpacity();
}

function showBottomMenu(y_offset, is_instant) {
	var speed = is_instant ? '0.0s' : '0.1s';
	var height = $('#bottomMenu').outerHeight() * 1.0;
	var offset = height + ((-height) * y_offset);
	var style = $('#bottomMenu')[0].style;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, ' + offset + 'px, 0px)';
	g_bottom_menu_visible = y_offset;

	setWallPaperOpacity();

	if (! g_are_page_previews_loading && g_bottom_menu_visible === 1.0) {
		console.info('Loading page previews .....................');
		g_are_page_previews_loading = true;
		var menu = $('#bottomMenu');
		menu.empty();

		var curr_image_index = g_image_index;
		var length = Object.keys(g_titles).length;
		var loadNextPagePreview = function(i) {
			if (i >= length) {
				return;
			}

			var file_name = g_titles[i];
			getCachedFile('small', file_name, function(blob) {
				console.info('Loading page preview #' + (i + 1));
				var url = null;
				if (blob) {
					url = URL.createObjectURL(blob)
					console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
				}

				var img = document.createElement('img');
				img.className = 'comicPreviewPortrait';
				img.title = g_titles[i];
				img.onclick = function(e) {
					g_image_index = i;
					loadCurrentPage();
					hideAllMenus(false);
					$(window).trigger('resize');
				};

				// The image loads successfully
				img.onload = function() {
					if (url) {
						URL.revokeObjectURL(url);
						console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
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
						console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
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
				menu.append(container);
			});
		};

		loadNextPagePreview(0);
	}
}

function showLibrary() {
	$('.settingsMenu').hide();

	var libraryMenu = $('#libraryMenu');
	libraryMenu.empty();
	var is_visible = libraryMenu.is(":visible");
	if (is_visible) {
		libraryMenu.hide();
		return;
	} else {
		libraryMenu.show();
	}

	var filesize = 0; // FIXME: Get the zip file size
	var filetype = ''; // FIXME: Get the zip file type

	var onStart = function(count) {
		if (count === 0) {
			libraryMenu.html('Library is empty');
		}
	};
	var onEach = function(filename, pagename, blob) {
		var img = new Image();
		img.title = filename;
		img.className = 'comicPreviewPortrait';

		if (pagename && blob) {
			var url = URL.createObjectURL(blob);
			console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
			console.info(pagename);
			img.onclick = function(e) {
				libraryMenu.hide();
				libraryMenu.empty();

				onLoaded(null, filename, filesize, filetype);
			};
			img.onload = function() {
				URL.revokeObjectURL(this.src);
				console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + this.src);

				// Make the image twice as wide if it is in landscape mode
				if (this.naturalWidth > this.naturalHeight) {
					this.className = 'comicPreviewLandscape';
				}
			};
			img.onerror = function() {
				URL.revokeObjectURL(this.src);
				console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + this.src);
			};
			img.src = url;
		} else {
			img.onclick = function(e) {
				libraryMenu.hide();
				libraryMenu.empty();

				onLoaded(null, filename, filesize, filetype);
			};
			img.src = 'invalid_image.png';
		}

		libraryMenu.append(img);
	};
	getAllCachedFirstPages(onStart, onEach);
}

function loadComic() {
	// Just return if there is no file selected
	var file_input = $('#fileInput');
	if (file_input[0].files.length === 0) {
		return;
	}

	// Get the file's info
	var file = file_input[0].files[0];
	var filename = file.name;
	var filesize = file.size;
	var filetype = file.type;

	onLoaded(file, filename, filesize, filetype);
}

function friendlyPageNumber() {
	return '(' + (g_image_index + 1) + ' of ' + g_image_count + ')';
}

function loadCurrentPage(cb) {
	console.info("@@@@@@@@@@@@@ loadCurrentPage");
	// Update the page number
	var page = friendlyPageNumber();
	$('.overlayPageNumber').html('&nbsp;' + page);
	$('.overlayPageNumber').show();
	document.title = page + ' "' + g_file_name + '" - Comic Book Reader';

	// Mouse mode
	if (g_is_mouse_mode) {

		loadImage($('#mousePageMiddle'), g_image_index, true, function() {
			if (cb) {
				cb();
			}
		});
	// Touch mode
	} else {
		// Load the middle page
		loadImage(g_page_middle, g_image_index, true, function() {
			if (cb) {
				cb();
			}
			updateScrollBar();
		});

		// Load right page
		if (g_image_index === g_image_count -1) {
			g_page_right.empty();
		} else if (g_image_index < g_image_count -1) {
			loadImage(g_page_right, g_image_index + 1, false, function() {
				updateScrollBar();
			});
		}

		// Load left page
		if (g_image_index === 0) {
			g_page_left.empty();
		} else if (g_image_index > 0) {
			loadImage(g_page_left, g_image_index - 1, false, function() {
				updateScrollBar();
			});
		}
	}
}

function loadImage(page, index, is_position_reset, cb) {
	var filename = g_titles[index];

	// Just return if there is no index
	if (! filename) {
		console.info('!!!!!!!!!!!!!!! Missing url for index:' + index);
		return;
	}

	// Just return if the new and old images are the same
	var children = page.children();
	if (children && children.length > 0 && children[0].title && children[0].title === filename) {
		return;
	}

	// Remove the image and reset the page position if needed
	page.empty();
	if (is_position_reset) {
		var style = page[0].style;
		style.transitionDuration = '0.0s';
		style.transform = 'translate3d(0px, 0px, 0px)';
	}

	getCachedFile('big', filename, function(blob) {
		var url = URL.createObjectURL(blob);
		console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url + ', ' + filename);

		// Create a new image
		var img = document.createElement('img');
		img.id = 'page_' + index;
		img.title = filename;
		img.className = 'comicPage';
		img.ondragstart = function() { return false; }
		img.onload = function() {
			URL.revokeObjectURL(url);
			console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);

			console.info('!!! Loading image ' + index + ': ' + img.title);
			if (g_needs_resize) {
				onResize(g_screen_width, g_screen_height);
			}
			if (cb)
				cb();
		};
		img.onerror = function() {
			URL.revokeObjectURL(url);
			console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);

			img.onload = null;
			img.onerror = null;

			img.title = '';
			img.alt = 'Invalid Image';
			img.src = 'invalid_image.png';

			onResize(g_screen_width, g_screen_height);
			if (cb)
				cb();
		};
		img.draggable = 'false';
		img.src = url;

		page.append(img);
	});
}

function setComicData(name) {
	g_file_name = name;
	$('#nameValue').text(name);
}

function clearComicData() {
	// Reset the UI
	$('#loadError').hide();
	setComicData('');
	g_page_middle.empty();
	g_page_left.empty();
	g_page_right.empty();
	$('#bottomMenu').empty();

	// Close the connection to indexedDB
	dbClose();

	// Remove all the old images, compressed file entries, and object urls
	g_image_index = 0;
	g_image_count = 0;
	g_titles = {};
	g_scroll_y_temp = 0;
	g_scroll_y_start = 0;
	g_are_page_previews_loading = false;
}

// FIXME: Remove the size and type parameters, as they are not used
function onLoaded(blob, filename, filesize, filetype) {
	$('body')[0].style.backgroundColor = 'black';

	// Clear everything
	$('.btnFileLoad').prop('disabled', true);
	$('.btnLibrary').prop('disabled', true);
	$('.btnSettings').prop('disabled', true);
	hideAllMenus(false);
	clearComicData();
	setComicData(filename);

	// Read the file
	$('#comicPanel').show();

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
	$('#comicPanel').hide();
	setComicData('');
	$('#loadError').text('Error: ' + msg);
	$('#loadError').show();
	showTopMenu(1.0, true);

	$('.btnFileLoad').prop('disabled', false);
	$('.btnLibrary').prop('disabled', false);
	$('.btnSettings').prop('disabled', false);
}

function largestNumber(a, b, c) {
	var larger = a > b ? a : b;
	larger = larger > c ? larger : c;
	return larger;
}

function ignoreEvent(e) {
	//console.info(e.type);
	e.preventDefault();
	e.stopPropagation();
}

function onMouseDown(e) {
	console.log('@@@@@@ onMouseDown');
	var x = e.clientX;
	var y = e.clientY;
	onInputDown(e.target, x, y);
}

function onMouseUp(e) {
	console.log('@@@@@@ onMouseUp');
	onInputUp();
}

function onMouseMove(e) {
	//console.log('@@@@@@ onMouseMove');
	var x = e.clientX;
	var y = e.clientY;
	onInputMove(x, y);
}

function onInputDown(target, x, y) {
	console.info(target);

	// If any menus are showing, hide them
	if (g_top_menu_visible > 0.0 || g_bottom_menu_visible > 0.0) {
		hideAllMenus(false);
		return;
	}

	g_is_mouse_down = true;
	g_mouse_start_x = x;
	g_mouse_start_y = y;
	//console.info(x + ', ' + y);

	// Add a glow around the top menu if it is the thing that is selected
	if (g_mouse_start_y < g_down_swipe_size) {
		$('#topMenu').addClass('menuWithGlow');
	}

	// Add a glow around the bottom menu if it is the thing that is selected
	if ((g_screen_height - g_mouse_start_y) < g_down_swipe_size) {
		$('#bottomMenu').addClass('menuWithGlow');
	}
}

function onInputUp() {
	console.info(g_is_swiping_left + ', ' + g_is_swiping_right);

	// Remove glow from the top menu if it is not completly out
	if (g_top_menu_visible !== 1.0) {
		$('#topMenu').removeClass('menuWithGlow');
	}

	// Remove glow from the bottom menu if it is not completly out
	if (g_bottom_menu_visible !== 1.0) {
		$('#bottomMenu').removeClass('menuWithGlow');
	}

	if ((g_top_menu_visible > 0.0 && g_top_menu_visible < 1.0) ||
		(g_bottom_menu_visible > 0.0 && g_bottom_menu_visible < 1.0)) {
		hideAllMenus(false);
	}

	if (! g_is_mouse_down) {
		return;
	}
	g_is_mouse_down = false;
	g_scroll_y_start += g_scroll_y_temp;
	g_scroll_y_temp = 0;

	// Turning page right
	if (g_is_swiping_right) {
		g_is_swiping_right = false;

		var style = $('#comicPanel')[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_page_width * 1) + 'px, 0px, 0px)';

		// Update the page orderings, after the pages move into position
		setTimeout(function() {
			var style = $('#comicPanel')[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(0px, 0px, 0px)';
			g_scroll_y_start = 0;

			if (g_image_index > 0) {
				g_image_index--;
				loadCurrentPage();
			}
		}, 300);
	// Turning page left
	} else if (g_is_swiping_left) {
		g_is_swiping_left = false;

		var style = $('#comicPanel')[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (- (g_page_width * 1)) + 'px, 0px, 0px)';

		// Update the page orderings, after the pages move into position
		setTimeout(function() {
			var style = $('#comicPanel')[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(0px, 0px, 0px)';
			g_scroll_y_start = 0;

			if (g_image_index < g_image_count -1) {
				g_image_index++;
				loadCurrentPage();
			}
		}, 300);
	// Reset the page to center
	} else {
		var style = $('#comicPanel')[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(0px, 0px, 0px)';
		g_scroll_y_start = 0;
	}

	overlayShow(true);
}

function onInputMove(x, y) {
	if (! g_is_mouse_down) {
		return;
	}
	console.info("!!!!!!!!!!!!!!!!!!!!!!!!! onInputMove");
	// Figure out if we are moving vertically or horizontally
	var is_vertical = false;
	if (Math.abs(y - g_mouse_start_y) > Math.abs(x - g_mouse_start_x)) {
		is_vertical = true;
	} else {
		is_vertical = false;
	}

	// Get how far we have moved since pressing down
	var x_offset = x - g_mouse_start_x;
	var y_offset = y - g_mouse_start_y;

	if (is_vertical) {
		// Show the top panel if we are swiping down from the top
		if (g_mouse_start_y < g_down_swipe_size && y_offset > 0) {
			var y = y_offset > g_down_swipe_size ? g_down_swipe_size : y_offset;
			showTopMenu(y / g_down_swipe_size, true);
		// Show the bottom panel if we are swiping up from the bottom
		} else if ((g_screen_height - g_mouse_start_y) < g_down_swipe_size && y_offset < 0) {
			var y = (-y_offset) > g_down_swipe_size ? g_down_swipe_size : (-y_offset);
			showBottomMenu(y / g_down_swipe_size, true);
		// Scroll the page up and down
		} else {
//			console.info('fuuuuuuuuuuuuuuuu');
			// FIXME: Super slow to call every movement. Look for similar calls, and replace them
			var zzz = $('#pageMiddle').children();
			console.info(zzz);
			var image_height = $('#' + zzz[0].id).height();
			x_offset = x_offset / 20.0;
			y_offset = y_offset / 20.0;

			// Reset the scroll position if it goes past the screen top or bottom
			var new_offset = y_offset + g_scroll_y_start;
			if (new_offset > 0) {
				new_offset = 0;
			} else if (image_height + new_offset < g_screen_height) {
				new_offset = g_screen_height - image_height;
			}

			// Only scroll down if the top of the image is above the screen top
			// Only scroll up if the bottom of the image is below the screen bottom
			g_scroll_y_start = new_offset;

			var x = g_page_width;
			var style = $('#pageMiddle')[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + x + 'px, ' + new_offset + 'px, 0px)';

			updateScrollBar();
		}
	}

	// Scroll the comic panels if we are swiping right or left
	if (! is_vertical) {
		var x = x_offset;
		var y = g_scroll_y_temp + g_scroll_y_start;
		var style = $('#comicPanel')[0].style;
		style.transitionDuration = '0.0s';
		style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';

		// Swiping right
		if (x_offset > 0) {
			if (Math.abs(x_offset) > (g_page_width / 2) && g_image_index > 0) {
				g_is_swiping_right = true;
			} else {
				g_is_swiping_right = false;
				g_is_swiping_left = false;
			}
		// Swiping left
		} else {
			if (Math.abs(x_offset) > (g_page_width / 2) && g_image_index < g_image_count -1) {
				g_is_swiping_left = true;
			} else {
				g_is_swiping_right = false;
				g_is_swiping_left = false;
			}
		}
	}
}

function onMouseWheel(e) {
	// Just do default mouse wheel things if not on the middle page
	if (e.target !== g_page_middle[0]) {
		return;
	}

	e.preventDefault();
	e.stopPropagation();

	var y_offset = 0;
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	if (delta === 1) {
		y_offset = 100;
	} else if (delta === -1) {
		y_offset = -100;
	}

	g_moving_page = g_page_middle[0];
	var image_height = $('#' + g_moving_page.children[0].id).height();

	// Reset the scroll position if it goes past the screen top or bottom
	var new_offset = y_offset + g_scroll_y_start;
	if (new_offset > 0) {
		new_offset = 0;
	} else if (image_height + new_offset < g_screen_height) {
		new_offset = g_screen_height - image_height;
	}

	// Only scroll down if the top of the image is above the screen top
	// Only scroll up if the bottom of the image is below the screen bottom
	if (new_offset <= 0 && image_height + new_offset >= g_screen_height) {
		g_scroll_y_start = new_offset;

		var x = (g_moving_page.panel_index * g_screen_width);
		var style = g_moving_page.style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + x + 'px, ' + new_offset + 'px, 0px)';

		updateScrollBar();
	}
}

function onKeyPress(e) {
	// Just return if not an arrow key
	if (e.keyCode < 37 || e.keyCode > 40) {
		return;
	}

	e.preventDefault();

	var y_offset = 0;
	switch (e.keyCode) {
		case 40: // Arrow down
			y_offset = -100;
			break;
		case 38: // Arrow up
			y_offset = 100;
			break;
		case 37: // Arrow left
			return;
		case 39: // Arrow right
			return;
	}

	g_moving_page = g_page_middle[0];
	var image_height = $('#' + g_moving_page.children[0].id).height();

	// Reset the scroll position if it goes past the screen top or bottom
	var new_offset = y_offset + g_scroll_y_start;
	if (new_offset > 0) {
		new_offset = 0;
	} else if (image_height + new_offset < g_screen_height) {
		new_offset = g_screen_height - image_height;
	}

	// Only scroll down if the top of the image is above the screen top
	// Only scroll up if the bottom of the image is below the screen bottom
	if (new_offset <= 0 && image_height + new_offset >= g_screen_height) {
		g_scroll_y_start = new_offset;

		var x = (g_moving_page.panel_index * g_screen_width);
		var style = g_moving_page.style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + x + 'px, ' + new_offset + 'px, 0px)';

		updateScrollBar();
	}
}

function onResize(screen_width, screen_height) {
//	console.info('Resize called ...');
	g_screen_width = screen_width;
	g_screen_height = screen_height;
	g_page_width = (g_screen_width / 3);
	g_scroll_y_temp = 0;
	g_scroll_y_start = 0;

	// Close the menus if they are partially open
	if ((g_top_menu_visible > 0.0 && g_top_menu_visible < 1.0) ||
		(g_bottom_menu_visible > 0.0 && g_bottom_menu_visible < 1.0)) {
		hideAllMenus(true);
	}
	if (g_top_menu_visible >= 0.0) {
		showTopMenu(g_top_menu_visible, true);
	}
	if (g_bottom_menu_visible >= 0.0) {
		showBottomMenu(g_bottom_menu_visible, true);
	}

	// Figure out if the images are loaded yet.
	// If not, we will manually fire the resize event when they do
	var children = g_page_middle.children();
	if (children.length === 0) {
		g_needs_resize = true;
//		console.info('Needs resize ...');
		return;
	} else if (children[0].naturalWidth === 0) {
		g_needs_resize = true;
//		console.info('Needs resize ...');
		return;
	}
	console.info('??? Resize called ...');

	// Make the panel as wide as the screen
	g_needs_resize = false;
	var style = $('#comicPanel')[0].style;
	style.width = (g_screen_width * 1) + 'px';
	style.height = (g_screen_height * 1) + 'px';
	style.top = 0 + 'px';
	style.left = (- g_page_width) + 'px';

	// Make it as wide as the screen and as tall as the tallest image
	style = g_page_left[0].style;
	style.width = g_page_width + 'px';
	style.height = g_screen_height + 'px';

	// Make it as wide as the screen and as tall as the tallest image
	style = g_page_middle[0].style;
	style.width = g_page_width + 'px';
	style.height = g_screen_height + 'px';

	// Make it as wide as the screen and as tall as the tallest image
	style = g_page_right[0].style;
	style.width = g_page_width + 'px';
	style.height = g_screen_height + 'px';

	// Move the arrow to be on top of the right page
	style = $('#overlayRight')[0].style;
	style.width =  g_page_width + 'px';
	style.height = g_screen_height + 'px';
	style.transitionDuration = '0.0s';
	style.transform = 'translate3d(' + (2 * g_page_width) + 'px, 0px, 0px)';

	// Move the arrow to be on top of the left page
	style = $('#overlayLeft')[0].style;
	style.width =  g_page_width + 'px';
	style.height = g_screen_height + 'px';
	style.transitionDuration = '0.0s';
	style.transform = 'translate3d(' + (0 * g_page_width) + 'px, 0px, 0px)';

	updateScrollBar();
}

function updateScrollBar() {
	var children = g_page_middle.children();
	if (children.length <= 0) {
		return;
	}

	// Get the heights
	var image_height = $('#' + children[0].id).height();
	if (g_screen_height < 1 || image_height < 1) {
		return;
	}

	// Get the percentage of screen height to image height
	var height_percentage = g_screen_height / image_height;
	if (height_percentage > 1.0) {
		height_percentage = 1.0;
	}

	// Get the percentage of scroll height
	var y = g_scroll_y_temp + g_scroll_y_start;
	var y_percentage = (image_height + y) / image_height;

	// Update the scroll bar size and position
	var scroll_bar = $('#scrollBar');
	var style = scroll_bar[0].style;
	style.height = (height_percentage * g_screen_height) + 'px';
	style.top = (g_screen_height - (y_percentage * g_screen_height)) + 'px';

	// Hide the scroll bar if it is at least 98% full size
	if (height_percentage >= 0.98) {
		overlayHide();
	} else if (scroll_bar.is(':hidden')) {
		overlayShow(true);
	} else {
		overlayShow(false);
	}
}

function overlayHide() {
//	console.info('hide ...');
	var scroll_bar = $('#scrollBar');
	scroll_bar.hide();
}

function overlayShow(is_fading) {
	if (is_fading) {
//		console.info('show with fade ...');
	} else {
//		console.info('show ...');
	}
	var scroll_bar = $('#scrollBar');
	scroll_bar.stop();
	scroll_bar[0].style.opacity = 0.5;
	if (is_fading) {
		scroll_bar.show();
		scroll_bar.animate({
			opacity: 0.0
		}, 5000, function() {
			scroll_bar.hide();
//			console.info('fade stop ...');
		});
	}

	var overlay = $('.overlayPageNumber');
	overlay.stop();
	overlay.css({opacity: 0.5});
	if (is_fading) {
		overlay.show();
		overlay.animate({
			opacity: 0.0
		}, 5000, function() {
			overlay.hide();
//			console.info('fade stop ...');
		});
	}
}

function updateTotalUsersOnline() {
	console.info("Getting total users online ...");
	var update_timeout = 1000 * 60 * 5; // 5 minutes
	var user_id = settings_get_user_id();
	var url = "http://workhorsy.org/comic_book_reader_counter/count.php?id=" + user_id;

	$.get(url).success(function(data, status) {
		if (status === 'success') {
			$('#totalUsersOnline').text("Total users online: " + parseInt(data));
		}
	}).error(function(jqXHR, textStatus, errorThrown) {
		console.info(jqXHR);
		console.info(textStatus);
		console.info(errorThrown);
	});
	setTimeout(updateTotalUsersOnline, update_timeout);
}

function getApplicationCacheStatusText(status) {
	switch (status) {
		case window.applicationCache.UNCACHED:
			return 'UNCACHED';
		case window.applicationCache.IDLE:
			return 'IDLE';
		case window.applicationCache.CHECKING:
			return 'CHECKING';
		case window.applicationCache.DOWNLOADING:
			return 'DOWNLOADING';
		case window.applicationCache.UPDATEREADY:
			return 'UPDATE READY';
		case window.applicationCache.OBSOLETE:
			return 'OBSOLETE';
		default:
			return 'UNKNOWN';
	}
}

function updateApplicationCache() {
	// When an app cache update is available, prompt the user to reload the page
	window.applicationCache.addEventListener('updateready', function(e) {
		var is_updatable = settings_get_install_updates_enabled();
		if (is_updatable && window.applicationCache.status === window.applicationCache.UPDATEREADY) {
			if (confirm('Comic Book Reader has an update. Reload now?')) {
				window.location.reload();
			}
		}
	}, false);

	// Run the actual check
	var checkForUpdate = function() {
		var update_timeout = 1000 * 60 * 30; // 30 minutes
		var is_updatable = settings_get_install_updates_enabled();
		if (is_updatable) {
			var status = window.applicationCache.status;
			console.info('Checking for Application Cache update. Current status: ' + getApplicationCacheStatusText(status) + ' (' + status + ')');
			if (status !== window.applicationCache.UNCACHED) {
				try {
					window.applicationCache.update();
				} catch (e) {
					//
				}
			}
		}

		setTimeout(checkForUpdate, update_timeout);
	};

	setTimeout(checkForUpdate, 1000 * 10); // 10 seconds
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
				$('.loadingProgress').html('Loading 0.0% ...');
				$('.loadingProgress').show();
				break;
			case 'uncompressed_done':
				break;
			case 'uncompressed_each':
				var filename = e.data.filename;
				var index = e.data.index;
				var is_cached = e.data.is_cached;
				var is_last = e.data.is_last;

				g_titles[index] = filename;

				$('.loadingProgress').html('Loading ' + ((index / (g_image_count - 1)) * 100.0).toFixed(1) + '% ...');

				makePagePreview(filename, is_cached, function() {
					if (index === 0) {
						loadCurrentPage(function() {
							$(window).trigger('resize');
						});
					} else if (index === 1) {
						loadCurrentPage();
					}

					if (is_last) {
						stopWorker();

						$('.loadingProgress').hide();
						$('.loadingProgress').html('');
						$('.btnFileLoad').prop('disabled', false);
						$('.btnLibrary').prop('disabled', false);
						$('.btnSettings').prop('disabled', false);

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

// FIXME: Move this to a utility.js file
function imageToCanvas(img, width, height) {
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
	return canvas;
}

// FIXME: Move this to a utility.js file
function resizeImage(img, width, height, use_higher_quality, cb) {
	if (! use_higher_quality) {
		var source = imageToCanvas(img, width, height);
		source.toBlob(function(small_blob) {
			cb(small_blob);
		});
	} else {
		var source = imageToCanvas(img, img.width, img.height);

		var dest = document.createElement('canvas');
		dest.width = width;
		dest.height = height;

		window.pica.resizeCanvas(source, dest, {
				quality: 0,
				unsharpAmount: 80,
				unsharpRadius: 0.6,
				unsharpThreshold: 2,
				transferable: true
			}, function (err) {
				dest.toBlob(function(small_blob) {
					cb(small_blob);
				});
			}
		);
	}
}

function makePagePreview(filename, is_cached, cb) {
	if (! is_cached) {
		getCachedFile('big', filename, function(blob) {
			var url = URL.createObjectURL(blob);
			console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url + ', ' + filename);

			var img = new Image();
			img.onload = function() {
				if (url) {
					URL.revokeObjectURL(url);
					console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
					url = null;
				}

				var ratio = 200.0 / img.width;
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
					console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
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

function main() {
	// Show the welcome screen if this is the first run
	if (settings_get_is_first_run()) {
		$('#welcomeScreen').show();
	// Show the mouse UI
	} else if (settings_get_is_mouse_mode()) {
		$('#mouseUI').show();
	// Otherwise show the touch UI
	} else {
		$('#touchUI').show();
		hideBottomMenu(true);
		showTopMenu(true);
	}

	$('#btnInputMouse').click(function () {
		g_is_mouse_mode = true;
		settings_set_is_mouse_mode(g_is_mouse_mode);
		$('#welcomeScreen').hide();
		$('#mouseUI').show();
		settings_set_is_first_run(false);
	});

	$('#btnInputTouch').click(function () {
		g_is_mouse_mode = false;
		settings_set_is_mouse_mode(g_is_mouse_mode);
		$('#welcomeScreen').hide();
		$('#touchUI').show();
		hideBottomMenu(true);
		showTopMenu(true);
		settings_set_is_first_run(false);
	});

	$('#btnMousePageLeft').click(function () {
		if (g_image_index > 0) {
			g_image_index--;
			loadCurrentPage();
			$(window).trigger('resize');
		}
	});

	$('#btnMousePageRight').click(function () {
		if (g_image_index < g_image_count -1) {
			g_image_index++;
			loadCurrentPage();
			$(window).trigger('resize');
		}
	});

	$('#btnMouseLibrary').click(function() {
		alert('FIXME: Add the library menu for mouse mode.');
	});

	$('#btnMousePages').click(function() {
		alert('FIXME: Add the page selector for mouse mode.');
	});

	g_page_left = $('#pageLeft');
	g_page_middle = $('#pageMiddle');
	g_page_right = $('#pageRight');

	// Stop the right click menu from popping up
	$(document).on('contextmenu', function(e) {
		if (! settings_get_right_click_enabled()) {
			e.preventDefault();
		}
	});

	// Resize everything when the browser resizes
	$(window).resize(function() {
		var width = 900;//$(window).width();
		var height = 300;//$(window).height();
		onResize(width, height);
	});

	// Toggle full screen
	$('.btnFullScreen').click(function () {
		toggleFullScreen();
	});

	// Open github in a new tab
	$('.btnHomepage').click(function () {
		var url = "https://github.com/workhorsy/comic_book_reader";
		window.open(url, '_blank');
	});

	// Show the settings menu
	$('.btnSettings').click(function () {
		$('#libraryMenu').hide();
		$('#libraryMenu').empty();

		var is_visible = $('.settingsMenu').is(":visible");
		if (is_visible) {
			$('.settingsMenu').hide();
		} else {
			// Update the DB size
			$('.totalDBSize').text('. . .');
			getTotalSize(function(length) {
				$('.totalDBSize').text(toFriendlySize(length));
			});

			// Update the input mode
			g_is_mouse_mode = settings_get_is_mouse_mode();
			if (g_is_mouse_mode) {
				$('.btnIsMouseMode').prop('checked', true);
			} else {
				$('.btnIsTouchMode').prop('checked', true);
			}

			// Show the menu
			$('.settingsMenu').show();
		}
	});

	// Right click toggle
	$('.btnDisableRightClick').prop('checked', settings_get_right_click_enabled());
	$('.btnDisableRightClick').click(function() {
		var value = settings_get_right_click_enabled();
		settings_set_right_click_enabled(! value);
		$('.btnDisableRightClick').prop('checked', ! value);
	});

	$('.btnEnableInstallUpdates').prop('checked', settings_get_install_updates_enabled());
	$('.btnEnableInstallUpdates').click(function() {
		var value = settings_get_install_updates_enabled();
		settings_set_install_updates_enabled(! value);
		$('.btnEnableInstallUpdates').prop('checked', ! value);
	});

	$('.btnUseHigherQualityPreviews').prop('checked', settings_get_use_higher_quality_previews());
	$('.btnUseHigherQualityPreviews').click(function() {
		var value = settings_get_use_higher_quality_previews();
		settings_set_use_higher_quality_previews(! value);
		$('.btnUseHigherQualityPreviews').prop('checked', ! value);
	});

	$('.btnIsMouseMode').click(function() {
		settings_set_is_mouse_mode(true);
		$('#touchUI').hide();
		$('#mouseUI').show();
		$('.btnIsMouseMode').prop('checked', true);
	});
	$('.btnIsTouchMode').click(function() {
		settings_set_is_mouse_mode(false);
		$('#mouseUI').hide();
		$('#touchUI').show();
		hideBottomMenu(true);
		showTopMenu(true);
		$('.btnIsTouchMode').prop('checked', true);
	});

	// Delete indexedDB and localStorage data
	$('.btnClearAllData').click(function() {
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
				$('.btnDisableRightClick').prop('checked', settings_get_right_click_enabled());
				$('.btnEnableInstallUpdates').prop('checked', settings_get_install_updates_enabled());
				$('.btnUseHigherQualityPreviews').prop('checked', settings_get_use_higher_quality_previews());
				g_is_mouse_mode = settings_get_is_mouse_mode();
				if (g_is_mouse_mode) {
					$('.btnIsMouseMode').prop('checked', true);
				} else {
					$('.btnIsTouchMode').prop('checked', true);
				}

				$('.totalDBSize').text('. . .');
				getTotalSize(function(length) {
					$('.totalDBSize').text(toFriendlySize(length));
					alert('Done clearing all data');
				});
			}
		}
		deleteNextDB();
	});

	$('#btnTouchLibrary').click(function() {
		showLibrary();
	});

	// Open the file selection box
	$('.btnFileLoad').click(function() {
		$('#fileInput').click();
	});

	// Load the selected file
	$('#fileInput').change(function() {
		loadComic();
	});

	// Key press events
	$(document).keydown(onKeyPress);

	// Mouse wheel events
//	document.body.addEventListener('mousewheel', onMouseWheel, false);
//	document.body.addEventListener('DOMMouseScroll', onMouseWheel, false);

	// Mouse events for the page container
	var comicPanel = $('#comicPanel')[0];
	comicPanel.addEventListener('mousedown', onMouseDown, false);
	comicPanel.addEventListener('mouseup', onMouseUp, false);
	comicPanel.addEventListener('mouseleave', onMouseUp, false);
	comicPanel.addEventListener('mousemove', onMouseMove, false);

	// Reset everything
	$('#comicPanel').hide();
	$(window).trigger('resize');
	clearComicData();
	$('.btnFileLoad').prop('disabled', false);
	$('.btnLibrary').prop('disabled', false);
	$('.btnSettings').prop('disabled', false);

	// Warn the user if indexedDB is full
	var storage_is_full = localStorage.getItem('storage_is_full');
	if (storage_is_full && JSON.parse(storage_is_full)) {
		localStorage.removeItem('storage_is_full');
		alert('Storage is full! Remove data from indexedDB, or free up disk space.');
	}

	// FIXME: Check if indexedDB is full

	startWorker();
	$('.versionDate').text(getVersionDate());
	updateTotalUsersOnline();
	updateApplicationCache();
}

$(document).ready(function() {
	$('#welcomeScreen').hide();
	$('.settingsMenu').hide();
	$('#libraryMenu').hide();

	// Show an error message if any required browser features are missing
	requireBrowserFeatures(function() {
		main();
	});
});
