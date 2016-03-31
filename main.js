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
var g_is_busy_loading = false;

var g_has_scrolled = false;

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

function hideAllMenus(is_instant) {
	hideTopMenu(is_instant);
	hideBottomMenu(is_instant);
}

function hideTopMenu(is_instant) {
	var speed = is_instant ? '0.0s' : '0.3s';

	// Hide the top menus
	$('#settingsMenu').hide();
	$('#libraryMenu').hide();
	$('#libraryMenu').empty();
	$('#bottomMenu').show();

	// Remove glow from top and bottom menu
	$('#topMenuPanel').removeClass('menuWithGlow');

	// Hide the top menu
	var top_menu_panel = $('#topMenuPanel');
	var top_menu = $('#topMenu');
	var style = top_menu[0].style;
	var height = top_menu_panel.outerHeight() + 15;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, -' + height + 'px, 0px)';

	g_top_menu_visible = 0.0;
	$('#wallPaper')[0].style.opacity = 1.0;
}

function hideBottomMenu(is_instant) {
	var speed = is_instant ? '0.0s' : '0.3s';

	// Remove glow from top and bottom menu
	var bottom_menu_panel = $('#bottomMenuPanel');
	bottom_menu_panel.removeClass('menuWithGlow');

	// Hide the bottom menu
	bottom_menu_panel.empty();
	var height = bottom_menu_panel.outerHeight();
	var bottom = document.querySelector('#bottomMenu');
	bottom.style.transitionDuration = speed;
	bottom.style.transform = 'translate3d(0px, ' + height + 'px, 0px)';

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
	$('#topMenuPanel').addClass('menuWithGlow');
}

function loadPagePreview() {
	if (! g_are_page_previews_loading && g_bottom_menu_visible === 1.0) {
		console.info('Loading page previews .....................');
		g_are_page_previews_loading = true;
		var menu = $('#bottomMenuPanel');
		menu.empty();

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
					$('#comicPanel')[0].scrollLeft = i * g_screen_width;
					hideAllMenus(false);
					g_image_index = i;
					overlayShow();
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
				menu.append(container);
			});
		};

		loadNextPagePreview(0);
	}
}

function showLibrary() {
	$('#settingsMenu').hide();
	$('#bottomMenu').hide();

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
			//console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
			//console.info(pagename);
			img.onclick = function(e) {
				libraryMenu.hide();
				libraryMenu.empty();
				$('#bottomMenu').show();

				onLoaded(null, filename, filesize, filetype);
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
				libraryMenu.hide();
				libraryMenu.empty();
				$('#bottomMenu').show();

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
	img.title = "FIXME";
	img.className = 'comicPage unselectable';
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

		img.title = '';
		img.alt = 'Invalid Image';
		img.src = 'invalid_image.png';
		cb(index);
	};

	getCachedFile('big', filename, function(blob) {
		if (blob) {
			img.src_high = URL.createObjectURL(blob);
			console.info('    ' + img.src_high);
		}
		getCachedFile('small', filename, function(blob) {
			if (blob) {
				img.src_low = URL.createObjectURL(blob);
				console.info('    ' + img.src_low);
			}

			if (index < 2) {
				img.src = img.src_high;
			} else {
				img.src = img.src_low;
			}
			page.appendChild(img);
		});
	});
}

function setComicData(name) {
	g_file_name = name;
	$('#nameValue').text(name);
}

function clearComicData() {
	// Reset the UI
	document.title = 'Comic Book Reader';
	$('#loadError').hide();
	setComicData('');
	$('#bottomMenuPanel').empty();
	$('#horizontalScroller').empty();
	$('#comicPanel')[0].scrollLeft = 0;

	// Close the connection to indexedDB
	dbClose();

	// Remove all the old images, compressed file entries, and object urls
	g_image_index = 0;
	g_image_count = 0;
	g_titles = {};
	g_are_page_previews_loading = false;
}

// FIXME: Remove the size and type parameters, as they are not used
function onLoaded(blob, filename, filesize, filetype) {
	$('body')[0].style.backgroundColor = 'black';

	// Clear everything
	$('#btnFileLoad').prop('disabled', true);
	$('#btnLibrary').prop('disabled', true);
	$('#btnSettings').prop('disabled', true);
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

	$('#btnFileLoad').prop('disabled', false);
	$('#btnLibrary').prop('disabled', false);
	$('#btnSettings').prop('disabled', false);
}

function onResize() {
	g_screen_width = window.innerWidth;
	g_screen_height = window.innerHeight;
	//console.info(g_screen_width);

	var new_left = g_image_index * g_screen_width;
	document.querySelector('#comicPanel').scrollLeft = new_left;

	var height = $('#topMenuPanel').outerHeight();
	var new_y = - (height - (g_top_menu_visible * height));
	var top = document.querySelector('#topMenu');
	top.style.transitionDuration = '0.0s';
	top.style.transform = 'translate3d(0px, ' + new_y + 'px, 0px)';

	var height = $('#bottomMenuPanel').outerHeight();
	var new_y = height - (g_bottom_menu_visible * height);
	var bottom = document.querySelector('#bottomMenu');
	bottom.style.transitionDuration = '0.0s';
	bottom.style.transform = 'translate3d(0px, ' + new_y + 'px, 0px)';
}

function overlayShow() {
	// Update the page number
	var number = friendlyPageNumber();
	$('#overlayPageNumber').html(number);
	document.title = number + ' "' + g_file_name + '"';

	// Restart the animation
	var overlay = $('#overlayPageNumber');
	overlay.stop();
	overlay.css({opacity: 0.5});
	overlay.show();
	overlay.animate({
		opacity: 0.0
	}, 5000, function() {
		overlay.hide();
		//console.info('fade stop ...');
	});
}

function monitorTotalUsersOnline() {
	console.info("Getting total users online ...");
	var update_timeout = 1000 * 60 * 5; // 5 minutes
	var user_id = settings_get_user_id();
	var url = "http://comic-book-reader.com/server/count.php?id=" + user_id;

	$.get(url).success(function(data, status) {
		if (status === 'success') {
			$('#totalUsersOnline').text("Total users online: " + parseInt(data));
		}
	}).error(function(jqXHR, textStatus, errorThrown) {
		console.info(jqXHR);
		console.info(textStatus);
		console.info(errorThrown);
	});
	setTimeout(monitorTotalUsersOnline, update_timeout);
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

function monitorImageQualitySwapping() {
	var comic_panel = document.querySelector('#comicPanel');
	var old_left = comic_panel.scrollLeft;

	setInterval(function() {
		var new_left = comic_panel.scrollLeft;

		//console.info((! g_is_busy_loading) + ', ' + g_has_scrolled + ', ' + (! g_is_mouse_down) + ', ' + old_left + ', ' + new_left);
		if (! g_is_busy_loading && g_has_scrolled && old_left === new_left) {
			g_has_scrolled = false;

			//console.info('reset scroll ....................' + scroll_left);
			var new_page = Math.round(new_left / g_screen_width);
			new_left = new_page * g_screen_width;
			//console.info(new_page + ', ' + new_left);
			//$('#comicPanel').animate({scrollLeft: new_left}, 300);
			var scroller = document.querySelector('#horizontalScroller');
			/*
			animateCSS(
				scroller,
				'opacity: 1;',
				'opacity: 0;',
				'3s',
				9,
				'alternate'
			);
			*/

			setTimeout(function() {
				g_is_busy_loading = true;
				console.info(g_image_index + ', ' + new_page);

				// Get all the images to swap out the quality
				var imagesToSwap = [];
				for (var i=0; i<g_image_count; ++i) {
					var page = document.querySelector('#page_' + i);
					if (! page) continue;
					if (i === new_page-1 || i === new_page || i === new_page+1) {
						if (! page.src.endsWith(page.src_high)) {
							imagesToSwap.push({page: page, src: page.src_high});
						}
					} else {
						if (! page.src.endsWith(page.src_low)) {
							imagesToSwap.push({page: page, src: page.src_low});
						}
					}
				}

				// Swap out the images in serial
				var loadNextPage = function(i) {
					if (i >= imagesToSwap.length) {
						g_is_busy_loading = false;
						return;
					}

					var item = imagesToSwap[i];
					var page = item.page;
					var src = item.src;

					page.onload = function() {
						this.onload = null;
						this.onerror = null;
						console.info(this.src);
						loadNextPage(i + 1);
					};
					page.onerror = function() {
						this.onload = null;
						this.onerror = null;
						this.title = '';
						this.alt = 'Invalid Image';
						this.src = 'invalid_image.png';
						console.info(this.src);
						loadNextPage(i + 1);
					};
					page.src = src;
				};
				loadNextPage(0);
				g_image_index = new_page;
			}, 300);
		}

		old_left = new_left;
	}, 100);
}

function monitorApplicationCacheUpdates() {
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

function manuallyUpdateApplicationCache() {
	var status = window.applicationCache.status;
	console.info('Checking for Application Cache update. Current status: ' + getApplicationCacheStatusText(status) + ' (' + status + ')');
	if (status !== window.applicationCache.UNCACHED) {
		try {
			window.applicationCache.update();
		} catch (e) {
			console.log(e);
		}
	}
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
				$('#loadingProgress').html('Loading 0.0% ...');
				$('#loadingProgress').show();
				break;
			case 'uncompressed_done':
				console.info('!!!!!!!!!!!!!!!!!! monitorImageQualitySwapping');
				$('#comicPanel')[0].scrollLeft = 0;
				monitorImageQualitySwapping();
				overlayShow();
				break;
			case 'uncompressed_each':
				var filename = e.data.filename;
				var index = e.data.index;
				var is_cached = e.data.is_cached;
				var is_last = e.data.is_last;

				g_titles[index] = filename;

				$('#loadingProgress').html('Loading ' + ((index / (g_image_count - 1)) * 100.0).toFixed(1) + '% ...');

				makePagePreview(filename, is_cached, function() {
					var container = document.querySelector('#horizontalScroller');
					var page = document.createElement('div');
					page.className = 'verticalScroller unselectable';
					container.appendChild(page);

					loadImage(page, index, function() {
						//
					});

					if (is_last) {
						stopWorker();

						$('#loadingProgress').hide();
						$('#loadingProgress').html('');
						$('#btnFileLoad').prop('disabled', false);
						$('#btnLibrary').prop('disabled', false);
						$('#btnSettings').prop('disabled', false);

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

function onScroll(e) {
	g_has_scrolled = true;
}

function onMouseClick(e) {
	// Detect left clicks only
	if (g_top_menu_visible === 1.0 || g_bottom_menu_visible === 1.0) {
		hideAllMenus(false);
		return;
	}

	var comic_panel = document.querySelector('#comicPanel');
	// Get the current page
	var i = Math.round(comic_panel.scrollLeft / g_screen_width);
	var x = e.clientX;
	var y = e.clientY;

	// Open top menu
	if (y < 200) {
		showTopMenu(1.0, false);
	// Open bottom menu
	} else if (y > (g_screen_height - 200)) {
		// FIXME: Make this a showBottomMenu function
		var bottom = document.querySelector('#bottomMenu');
		bottom.style.transitionDuration = '0.3s';
		bottom.style.transform = 'translate3d(0px, ' + 200 + 'px, 0px)';
		g_bottom_menu_visible = 1.0;
		setWallPaperOpacity();
		$('#bottomMenuPanel').addClass('menuWithGlow');
		loadPagePreview();
	// Move page right or left
	} else {
		// Figure out if the click was on the right or left
		var is_right = (x > (g_screen_width / 2));

		// Next page
		if (is_right) {
			if (i < g_image_count - 1) i++;
		// Prev page
		} else {
			if (i > 0) i--;
		}
		var new_left = i * g_screen_width;
		g_image_index = i;
		overlayShow();

		g_is_busy_loading = true;
		animateValue(function(trans_value) {
			comic_panel.scrollLeft = trans_value;
			if (trans_value === new_left) {
				g_is_busy_loading = false;
			}
		}, comic_panel.scrollLeft, new_left, 600);
	}
}

function main() {
	// Show the welcome screen if this is the first run
	if (settings_get_is_first_run()) {
		$('#welcomeScreen').show();
	// Otherwise show the touch UI
	} else {
		$('#mainUI').show();
		hideBottomMenu(true);
		showTopMenu(true);
	}

	$('#btnInputTouch').click(function () {
		$('#welcomeScreen').hide();
		$('#mainUI').show();
		hideBottomMenu(true);
		showTopMenu(true);
		settings_set_is_first_run(false);
	});

	// Stop the right click menu from popping up
	$(document).on('contextmenu', function(e) {
		if (! settings_get_right_click_enabled()) {
			e.preventDefault();
		}
	});

	// Resize everything when the browser resizes
	$(window).resize(function() {
		var width = $(window).width();
		var height = $(window).height();
		onResize(width, height);
	});

	// Toggle full screen
	$('#btnFullScreen').click(function () {
		toggleFullScreen();
	});

	// Open github in a new tab
	$('#btnHomepage').click(function () {
		var url = "https://github.com/workhorsy/comic_book_reader";
		window.open(url, '_blank');
	});

	// Show the settings menu
	$('#btnSettings').click(function () {
		$('#libraryMenu').hide();
		$('#libraryMenu').empty();

		var is_visible = $('#settingsMenu').is(":visible");
		if (is_visible) {
			$('#settingsMenu').hide();
			$('#bottomMenu').show();
		} else {
			// Update the DB size
			$('#totalDBSize').text('. . .');
			getTotalSize(function(length) {
				$('#totalDBSize').text(toFriendlySize(length));
			});

			// Show the menu
			$('#settingsMenu').show();
			$('#bottomMenu').hide();
		}
	});

	// Right click toggle
	$('#btnDisableRightClick').prop('checked', settings_get_right_click_enabled());
	$('#btnDisableRightClick').click(function() {
		var value = settings_get_right_click_enabled();
		settings_set_right_click_enabled(! value);
		$('#btnDisableRightClick').prop('checked', ! value);
	});

	$('#btnEnableInstallUpdates').prop('checked', settings_get_install_updates_enabled());
	$('#btnEnableInstallUpdates').click(function() {
		var value = settings_get_install_updates_enabled();
		settings_set_install_updates_enabled(! value);
		$('#btnEnableInstallUpdates').prop('checked', ! value);
	});

	$('#btnUseHigherQualityPreviews').prop('checked', settings_get_use_higher_quality_previews());
	$('#btnUseHigherQualityPreviews').click(function() {
		var value = settings_get_use_higher_quality_previews();
		settings_set_use_higher_quality_previews(! value);
		$('#btnUseHigherQualityPreviews').prop('checked', ! value);
	});

	// Delete indexedDB and localStorage data
	$('#btnClearAllData').click(function() {
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
				$('#btnDisableRightClick').prop('checked', settings_get_right_click_enabled());
				$('#btnEnableInstallUpdates').prop('checked', settings_get_install_updates_enabled());
				$('#btnUseHigherQualityPreviews').prop('checked', settings_get_use_higher_quality_previews());

				$('#totalDBSize').text('. . .');
				getTotalSize(function(length) {
					$('#totalDBSize').text(toFriendlySize(length));
					alert('Done clearing all data');
				});
			}
		}
		deleteNextDB();
	});

	$('#btnCheckForUpdatesNow').click(function() {
		manuallyUpdateApplicationCache();
	});

	$('#btnLibrary').click(function() {
		showLibrary();
	});

	// Open the file selection box
	$('#btnFileLoad').click(function() {
		$('#fileInput').click();
	});

	// Load the selected file
	$('#fileInput').change(function() {
		loadComic();
	});

	// Hide the sliders if not in touch mode
	$('#topMenuSlider').hide();
	$('#bottomMenuSlider').hide();
/*
	var comicPanel = $('#comicPanel')[0];

	// Key press events
	$(document).keydown(onKeyPress);

	// Mouse wheel events
	comicPanel.addEventListener('mousewheel', onMouseWheel, false);
	comicPanel.addEventListener('DOMMouseScroll', onMouseWheel, false);
*/
	// Mouse events for the page container
	var comic_panel = document.querySelector('#comicPanel');
	comic_panel.addEventListener('click', onMouseClick, false);
	comic_panel.addEventListener('scroll', onScroll, false);

	// Reset everything
	$('#comicPanel').hide();
	$(window).trigger('resize');
	clearComicData();
	$('#btnFileLoad').prop('disabled', false);
	$('#btnLibrary').prop('disabled', false);
	$('#btnSettings').prop('disabled', false);

	// Warn the user if indexedDB is full
	var storage_is_full = localStorage.getItem('storage_is_full');
	if (storage_is_full && JSON.parse(storage_is_full)) {
		localStorage.removeItem('storage_is_full');
		alert('Storage is full! Remove data from indexedDB, or free up disk space.');
	}

	// FIXME: Check if indexedDB is full

	startWorker();
	$('#versionDate').text(getVersionDate());
	monitorTotalUsersOnline();
	monitorApplicationCacheUpdates();
}

$(document).ready(function() {
	$('#welcomeScreen').hide();
	$('#settingsMenu').hide();
	$('#libraryMenu').hide();

	// Show an error message if any required browser features are missing
	requireBrowserFeatures(function() {
		main();
	});
});
