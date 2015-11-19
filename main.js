// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader

var g_db = null;
var g_worker = null;
var g_file_name = null;
//var g_entries = [];
var g_images = [];
var g_image_index = 0;
var g_urls = {};
var g_titles = {};

var g_is_mouse_down = false;
var g_mouse_start_x = 0;
var g_mouse_start_y = 0;

var g_screen_width = 0;
var g_screen_height = 0;
var g_scroll_y_temp = 0;
var g_scroll_y_start = 0;
var g_needs_resize = false;

var g_down_swipe_size = 100.0;
var g_is_swiping_right = false;
var g_is_swiping_left = false;
var g_top_menu_visible = 1.0;

var g_moving_page = null;
var g_page_left = null;
var g_page_middle = null;
var g_page_right = null;


function toFrieldlySize(size) {
	if (size >= 1024000000) {
		return (size / 1024000000).toFixed(2) + ' GB';
	} else if (size >= 1024000) {
		return (size / 1024000).toFixed(2) + ' MB';
	} else if (size >= 1024) {
		return (size / 1024).toFixed(2) + ' KB';
	} else if (size >= 1) {
		return (size / 1).toFixed(2) + ' B';
	}

	return '?';
}

function hideTopMenu(is_instant) {
	var speed = is_instant ? '0.0s' : '0.3s';
	var top_menu = $('#topMenu');
	var style = top_menu[0].style;
	style.width = (g_screen_width - 80) + 'px';
	var height = top_menu.outerHeight() + 10;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, -' + height + 'px, 0px)';
	g_top_menu_visible = 0.0;
	$('#wallPaper')[0].style.opacity = 1.0;
}

function showTopMenu(y_offset, is_instant) {
	var speed = is_instant ? '0.0s' : '0.1s';
	var height = $('#topMenu').outerHeight();
	var offset = -height + (height * y_offset);
	var style = $('#topMenu')[0].style;
	style.transitionDuration = speed;
	style.transform = 'translate3d(0px, ' + offset + 'px, 0px)';
	style.width = (g_screen_width - 80) + 'px';
	g_top_menu_visible = y_offset;
	$('#wallPaper')[0].style.opacity = 1.0 - (0.9 * g_top_menu_visible);
}

function loadComic() {
	$('body')[0].style.backgroundColor = 'black';

	// Just return if there is no file selected
	var file_input = $('#fileInput');
	if (file_input[0].files.length === 0) {
		return;
	}

	// Load the file's info
	clearComicData();
	var file = file_input[0].files[0];
	setComicData(file.name, file.size, file.type);

	// Read the file
	onProgress(1, 1);
	$('#loadProgress').hide();
	$('#comicPanel').show();

	hideTopMenu(false);

	onLoaded(file);
}

function friendlyPageNumber() {
	return '(' + (g_image_index + 1) + ' of ' + g_images.length + ')';
}

function replaceIfDifferentImage(parent, image) {
	var children = parent.children();
	if (children.length === 0) {
		parent.append(image);
	} else if (children.length && children[0].id !== image.id) {
		var prev_img = children[0];
		prev_img.is_loaded = false;
		prev_img.removeAttribute('src');
		parent.empty();
		parent.append(image);
	}
}

function loadCurrentPage(cb) {
	// Update the page number
	var page = friendlyPageNumber();
	$('#overlayPageNumber')[0].innerHTML = page;
	document.title = page + ' "' + g_file_name + '" - Comic Book Reader';

	// Load the middle page
	loadImage(g_image_index, function() {
		replaceIfDifferentImage(g_page_middle, g_images[g_image_index]);
		if (cb) {
			cb();
		}
		updateScrollBar();
	});

	// Load right page
	if (g_image_index === g_images.length -1) {
		g_page_right.empty();
	} else if (g_image_index < g_images.length -1) {
		loadImage(g_image_index + 1, function() {
			replaceIfDifferentImage(g_page_right, g_images[g_image_index + 1]);
		});
	}

	// Load left page
	if (g_image_index === 0) {
		g_page_left.empty();
	} else if (g_image_index > 0) {
		loadImage(g_image_index - 1, function() {
			replaceIfDifferentImage(g_page_left, g_images[g_image_index - 1]);
		});
	}
}

function loadImage(index, cb) {
	var img = g_images[index];
	var url = g_urls[index];
	var title = g_titles[index];
	if (! img.is_loaded && url && title) {
		img.onload = function() {
			img.is_loaded = true;
			img.title = title;
//				console.info(img);
			console.info('!!! Loading image ' + index + ': ' + img.title);
			cb();
		};
		img.src = url;
	}
}

/*
function uncompressImage(i, cb) {
	var entry = g_entries[i];

	// Image is uncompressed and an Object URL
//	console.info(g_urls);
	if (g_urls.hasOwnProperty(i)) {
		var url = g_urls[i];
//		console.info('??? Already Uncompressed ' + i + ': ' + entry.filename);
		cb(entry.index, url, entry.filename);

	} else {
		getCachedFile('big', entry.filename, function(smaller_blob) {
			// Image is uncompressed and in file system
			if (smaller_blob) {
				//console.info(entry.filename);
				//console.info(smaller_blob + ', ' + smaller_blob.size);
				var smaller_url = URL.createObjectURL(smaller_blob);
				console.info('URL.createObjectURL: ' + smaller_url);
				g_urls[i] = smaller_url;
				cb(entry.index, smaller_url, entry.filename);
			// Image is compressed
			} else {
				console.info('!!! Uncompressing image ' + i + ': ' +  entry.filename);
				var filename = entry.filename;
				var index = entry.index;
				entry.getData(new zip.BlobWriter(), function(blob) {
					setTimeout(function() {
						// Save the image in the database
						setCachedFile('big', filename, blob, function() {
							setTimeout(function() {
								var smaller_url = URL.createObjectURL(blob);
								console.info('URL.createObjectURL: ' + smaller_url);
								cb(index, smaller_url, filename);
							}, 200);
						});

						// Send the image to the worker to be resized
						setTimeout(function() {
							var reader = new FileReader();
							reader.onload = function(evt) {
								setTimeout(function() {
									var array_buffer = reader.result;
									var message = {
										action: 'resize_image',
										filename: filename,
										index: index,
										array_buffer: array_buffer
									};
									g_worker.postMessage(message, [array_buffer]);
								}, 200);
							};
							reader.readAsArrayBuffer(blob);
						}, 200);
					}, 200);
				});
			}
		});
	}
}
*/
function setComicData(name, size, type) {
	g_file_name = name;
	$('#comicData').show();
	$('#nameValue').text(name);
	$('#sizeValue').text(toFrieldlySize(size));
	//$('#typeValue').text(type);
}

function clearComicData() {
	// Reset the UI
	$('#loadError').hide();
	$('#comicData').hide();
	$('#loadProgress').val(0);
	setComicData('?', '?', '?');
	g_page_middle.empty();
	g_page_left.empty();
	g_page_right.empty();

	// Remove all the Object URLs
	Object.keys(g_urls).forEach(function(i) {
		var url = g_urls[i];
		URL.revokeObjectURL(url);
		console.info('URL.revokeObjectURL: ' + url);
	});
	g_images.forEach(function(img) {
		img.removeAttribute('src');
	});

	// Remove all the old images, compressed file entries, and object urls
	g_image_index = 0;
	g_images = [];
//	g_entries = [];
	g_urls = {};
	g_titles = {};
	g_scroll_y_temp = 0;
	g_scroll_y_start = 0;
}
/*
function uncompressAllImages(i) {
	i = i || 0;
	uncompressImage(i, function(j, url, filename) {
		setTimeout(function() {
			j++;
			if (j < g_entries.length) {
				uncompressAllImages(j);
			}
		}, 100);
	});
}
*/
function onLoaded(file) {
	var blob = file.slice();

	var reader = new FileReader();
	reader.onload = function(evt) {
		var array_buffer = reader.result;
		var message = {
			action: 'uncompress',
			filename: file.name,
			array_buffer: array_buffer
		};
		g_worker.postMessage(message, [array_buffer]);
	};
	reader.readAsArrayBuffer(blob);
/*
	var reader = new zip.BlobReader(blob);
	zip.createReader(reader, function(reader) {
		reader.getEntries(function(entries) {
			// Get only the entries that are valid images
			g_entries = [];
			entries.forEach(function(entry) {
				if (! entry.directory && isValidImageType(entry.filename)) {
					g_entries.push(entry);
				}
			});

			// Sort the entries by their file names
			g_entries.sort(function(a, b){
				if(a.filename < b.filename) return -1;
				if(a.filename > b.filename) return 1;
				return 0;
			});

			// Create empty images for each page
			var i = 0;
			g_entries.forEach(function(entry) {
				var img = document.createElement('img');
				img.id = 'page_' + i;
				img.title = entry.filename;
				img.className = 'comicImage';
				img.ondragstart = function() { return false; }
				img.onload = function() {
					if (g_needs_resize) {
						onResize(g_screen_width, g_screen_height);
					}
				};
				img.draggable = 'false';
				g_images.push(img);
				entry.index = i;
				i++;
			});

			g_image_index = 0;
			loadCurrentPage(function() {
				var width = $(window).width();
				var height = $(window).height();
				onResize(width, height);
			});
			uncompressAllImages();
		});
	}, function(e) {
		onError('Failed to read file!');
	});
*/
}

function onError(msg) {
	$('#comicPanel').hide();
	$('#comicData').hide();
	$('#loadError').text('Error: ' + msg);
	$('#loadError').show();
	showTopMenu(1.0, true);
}

function onProgress(loaded, total) {
	$('#loadProgress').show();
	$('#loadProgress').val(loaded / total);
}

function largestNumber(a, b, c) {
	var larger = a > b ? a : b;
	larger = larger > c ? larger : c;
	return larger;
}

function largestPageNaturalHeight() {
	var left_children = g_page_left.children();
	var middle_children = g_page_middle.children();
	var right_children = g_page_right.children();

	var left_width = left_children.length > 0 ? left_children[0].naturalWidth : 0;
	var middle_width = middle_children.length > 0 ? middle_children[0].naturalWidth : 0;
	var right_width = right_children.length > 0 ? right_children[0].naturalWidth : 0;

	var left_ratio = left_width !== 0 ? g_screen_width / left_width : 0;
	var middle_ratio = middle_width !== 0 ? g_screen_width / middle_width : 0;
	var right_ratio = right_width !== 0 ? g_screen_width / right_width : 0;

	var left_height = left_children.length > 0 ? left_ratio * left_children[0].naturalHeight : 0;
	var middle_height = middle_children.length > 0 ? middle_ratio * middle_children[0].naturalHeight : 0;
	var right_height =  right_children.length > 0 ?  right_ratio *  right_children[0].naturalHeight : 0;

	return largestNumber(left_height, middle_height, right_height);
}

function ignoreEvent(e) {
	//console.info(e.type);
	e.preventDefault();
	e.stopPropagation();
}

function onTouchStart(e) {
	//e.preventDefault();
	//e.stopPropagation();

	g_moving_page = g_page_middle[0];
	var x = e.changedTouches[0].clientX | 0;
	var y = e.changedTouches[0].clientY | 0;
	onInputDown(e.target, x, y);
}

function onTouchEnd(e) {
	//e.preventDefault();
	//e.stopPropagation();

	g_moving_page = null;
	onInputUp();
}

function onTouchMove(e) {
	e.preventDefault();
	e.stopPropagation();

	var x = e.changedTouches[0].clientX | 0;
	var y = e.changedTouches[0].clientY | 0;
	onInputMove(x, y);
}

function onPointerStart(e) {
	g_moving_page = g_page_middle[0];
	var x = e.clientX | 0;
	var y = e.clientY | 0;
	onInputDown(e.target, x, y);
}

function onPointerEnd(e) {
	g_moving_page = null;
	onInputUp();
}

function onPointerMove(e) {
	var x = e.clientX | 0;
	var y = e.clientY | 0;
	onInputMove(x, y);
}

function onPageMouseDown(e) {
	if (this.panel_index === 1) {
		g_moving_page = this;
	} else {
		g_moving_page = null;
	}
}

function onMouseDown(e) {
	var x = e.clientX;
	var y = e.clientY;
	onInputDown(e.target, x, y);
}

function onMouseUp(e) {
	onInputUp();
}

function onMouseMove(e) {
	var x = e.clientX;
	var y = e.clientY;
	onInputMove(x, y);
}

function onInputDown(target, x, y) {
	// Skip if clicking on something that is no touchable
	if (! target.hasAttribute('touchable')) {
		return;
	}

	// If the top menu is showing, hide it
	if (target.hasAttribute('touchable') && g_top_menu_visible > 0.0) {
		hideTopMenu(false);
		return;
	}

	g_is_mouse_down = true;
	g_mouse_start_x = x;
	g_mouse_start_y = y;
	//console.info(x + ', ' + y);
}

function onInputUp() {
	if (g_top_menu_visible > 0.0 && g_top_menu_visible < 1.0) {
		hideTopMenu(false);
	}

	if (! g_is_mouse_down) {
		return;
	}
	g_is_mouse_down = false;
	g_moving_page = null;
	g_scroll_y_start += g_scroll_y_temp;
	g_scroll_y_temp = 0;


	if (g_is_swiping_right) {
		g_is_swiping_right = false;

		var style = g_page_middle[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width * 2) + 'px, 0px, 0px)';

		style = g_page_left[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width) + 'px, 0px, 0px)';

		style = $('#overlayLeft')[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width) + 'px, 0px, 0px)';

		// Update the page orderings, after the pages move into position
		setTimeout(function() {
			var old_left = g_page_left;
			var old_middle = g_page_middle;
			var old_right = g_page_right;
			g_page_right = old_middle;
			g_page_middle = old_left;
			g_page_left = old_right;

			g_page_left[0].panel_index = 0;
			g_page_middle[0].panel_index = 1;
			g_page_right[0].panel_index = 2;

			style = g_page_left[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + (g_page_left[0].panel_index * g_screen_width) + 'px, 0px, 0px)';

			style = $('#overlayLeft')[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + (0 * g_screen_width) + 'px, 0px, 0px)';
			g_scroll_y_start = 0;

			if (g_image_index > 0) {
				g_image_index--;
				loadCurrentPage();
			}
		}, 300);
	} else if (g_is_swiping_left) {
		g_is_swiping_left = false;

		var style = g_page_middle[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(0px, 0px, 0px)';

		style = g_page_right[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width) + 'px, 0px, 0px)';

		style = $('#overlayRight')[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width) + 'px, 0px, 0px)';

		// Update the page orderings, after the pages move into position
		setTimeout(function() {
			var old_left = g_page_left;
			var old_middle = g_page_middle;
			var old_right = g_page_right;
			g_page_left = old_middle;
			g_page_middle = old_right;
			g_page_right = old_left;

			g_page_left[0].panel_index = 0;
			g_page_middle[0].panel_index = 1;
			g_page_right[0].panel_index = 2;

			style = g_page_right[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + (g_page_right[0].panel_index * g_screen_width) + 'px, 0px, 0px)';
			g_scroll_y_start = 0;

			style = $('#overlayRight')[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + (2 * g_screen_width) + 'px, 0px, 0px)';

			if (g_image_index < g_images.length -1) {
				g_image_index++;
				loadCurrentPage();
			}
		}, 300);
	} else {
		var style = g_page_left[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(0px, 0px, 0px)';

		var y = g_scroll_y_temp + g_scroll_y_start;
		style = g_page_middle[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width * 1) + 'px, ' + y + 'px, 0px)';

		style = g_page_right[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width * 2) + 'px, 0px, 0px)';

		style = $('#overlayLeft')[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width * 0) + 'px, 0px, 0px)';

		style = $('#overlayRight')[0].style;
		style.transitionDuration = '0.3s';
		style.transform = 'translate3d(' + (g_screen_width * 2) + 'px, 0px, 0px)';
	}

	overlayShow(true);
}

function onInputMove(x, y) {
	if (! g_is_mouse_down) {
		return;
	}

	// Figure out if we are moving vertically or horizontally
//		console.info(x + ', ' + g_mouse_start_x + ', ' + g_moving_page.panel_index + ', ' + g_moving_page.id);
	var is_vertical = false;
	if (Math.abs(y - g_mouse_start_y) > Math.abs(x - g_mouse_start_x)) {
		is_vertical = true;
	} else {
		is_vertical = false;
	}

	// Get how far we have moved since pressing down
//		console.info(is_vertical);
//		console.info(x + ', ' + y + ', ' + is_vertical);
	var x_offset = x - g_mouse_start_x;
	var y_offset = y - g_mouse_start_y;
//		console.info(y_offset);

	//console.info(g_mouse_start_y);
//		console.info(is_vertical + ', ' + x_offset + ', ' + y_offset);
	if (is_vertical && g_moving_page) {
//			console.info('vertical ...');
		// Show the top panel if we are swiping down from the top
		if (g_mouse_start_y < g_down_swipe_size && y_offset > 0) {
			var y = y_offset > g_down_swipe_size ? g_down_swipe_size : y_offset;
//			console.info(y / g_down_swipe_size);
			showTopMenu(y / g_down_swipe_size, false);
		// Scroll the page up and down
		} else {
			var image_height = $('#' + g_moving_page.children[0].id).height();

			// Only scroll down if the top of the image is above the screen top
			// Only scroll up if the bottom of the image is below the screen bottom
			var new_offset = y_offset + g_scroll_y_start;
			if (new_offset <= 0 && image_height + new_offset > g_screen_height) {
				g_scroll_y_temp = y_offset;

				var x = (g_moving_page.panel_index * g_screen_width);
				var style = g_moving_page.style;
				style.transitionDuration = '0.0s';
				style.transform = 'translate3d(' + x + 'px, ' + new_offset + 'px, 0px)';

				updateScrollBar();
			}
		}
	}

	// Scroll the comic panels if we are swiping right or left
	if (! is_vertical && g_moving_page) {
		var x = (g_moving_page.panel_index * g_screen_width) + x_offset;
		var y = g_scroll_y_temp + g_scroll_y_start;
		var style = g_moving_page.style;
		style.transitionDuration = '0.0s';
		style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';

		// Swiping right
		if (x_offset > 0) {
			var x = (g_page_left[0].panel_index * g_screen_width) + x_offset;
			var style = g_page_left[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + x + 'px, 0px, 0px)';

			style = $('#overlayLeft')[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + x + 'px, 0px, 0px)';

			if (Math.abs(x_offset) > g_screen_width / 2 && g_image_index > 0) {
//				console.info(Math.abs(x_offset) + ' > ' + (g_screen_width / 2));
				g_is_swiping_right = true;
			} else {
				g_is_swiping_right = false;
				g_is_swiping_left = false;
			}
		// Swiping left
		} else {
			var x = (g_page_right[0].panel_index * g_screen_width) + x_offset;
			var style = g_page_right[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + x + 'px, 0px, 0px)';

			style = $('#overlayRight')[0].style;
			style.transitionDuration = '0.0s';
			style.transform = 'translate3d(' + x + 'px, 0px, 0px)';

			if (Math.abs(x_offset) > g_screen_width / 2 && g_image_index < g_images.length -1) {
//				console.info(Math.abs(x_offset) + ' > ' + (g_screen_width / 2));
				g_is_swiping_left = true;
			} else {
				g_is_swiping_right = false;
				g_is_swiping_left = false;
			}
		}
	}
}

function onMouseWheel(e) {
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
	g_scroll_y_temp = 0;
	g_scroll_y_start = 0;

	// Move the top menu to the new top
	if (g_top_menu_visible < 1.0) {
		hideTopMenu(true);
	} else {
		showTopMenu(g_top_menu_visible, true);
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

	// Find the largest natural height from the images
	var height = largestPageNaturalHeight();

	// Make the panel as wide as the screen
	g_needs_resize = false;
	$('#comicPanel')[0].style.width = (g_screen_width * 1) + 'px';

	// Make it as wide as the screen and as tall as the tallest image
	var style = $('#pageContainer')[0].style;
	style.width = (g_screen_width * 3) + 'px';
	style.height = height + 'px';
	style.transitionDuration = '0.0s';
	style.transform = 'translate3d(-' + g_screen_width + 'px, 0px, 0px)';

	// Make it as wide as the screen and as tall as the tallest image
	style = $('#overlayPageNumber')[0].style;
	style.width = g_screen_width + 'px';
	style.height = g_screen_height + 'px';
	style.transitionDuration = '0.0s';
	style.transform = 'translate3d(' + (1 * g_screen_width) + 'px, 0px, 0px)';

	// Make the overlay font 10% the screen width
	var size = g_screen_width / 10;
	if (size < 50) {
		size = 50;
	}
	style.fontSize = size + 'px';

	// Make it as wide as the screen and as tall as the tallest image
	style = g_page_left[0].style;
	style.width = g_screen_width + 'px';
	style.height = height + 'px';
	style.transitionDuration = '0.0s';
	g_page_left[0].panel_index = 0;
	style.transform = 'translate3d(' + (g_page_left[0].panel_index * g_screen_width) + 'px, 0px, 0px)';

	// Make it as wide as the screen and as tall as the tallest image
	style = g_page_middle[0].style;
	style.width = g_screen_width + 'px';
	style.height = height + 'px';
	style.transitionDuration = '0.0s';
	g_page_middle[0].panel_index = 1;
	var x = g_page_middle[0].panel_index * g_screen_width;
	var y = g_scroll_y_temp + g_scroll_y_start;
	style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0px)';

	// Make it as wide as the screen and as tall as the tallest image
	style = g_page_right[0].style;
	style.width = g_screen_width + 'px';
	style.height = height + 'px';
	style.transitionDuration = '0.0s';
	g_page_right[0].panel_index = 2;
	style.transform = 'translate3d(' + (g_page_right[0].panel_index * g_screen_width) + 'px, 0px, 0px)';

	// Move the arrow to be on top of the right page
	style = $('#overlayRight')[0].style;
	style.width =  g_screen_width + 'px';
	style.height = height + 'px';
	style.transitionDuration = '0.0s';
	style.transform = 'translate3d(' + (2 * g_screen_width) + 'px, 0px, 0px)';

	// Move the arrow to be on top of the left page
	style = $('#overlayLeft')[0].style;
	style.width =  g_screen_width + 'px';
	style.height = height + 'px';
	style.transitionDuration = '0.0s';
	style.transform = 'translate3d(' + (0 * g_screen_width) + 'px, 0px, 0px)';

	updateScrollBar();
}

function updateScrollBar() {
	// Get the heights
	var image_height = $('#' + g_page_middle.children()[0].id).height();
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
	style = scroll_bar[0].style;
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
//	var overlay = $('#overlayPageNumber');
//	overlay.hide();
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

	var overlay = $('#overlayPageNumber');
	overlay.stop();
	overlay[0].style.opacity = 0.5;
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

function getCachedFile(name, file_name, cb) {
	var store = g_db.transaction(name, 'readwrite').objectStore(name);
	var request = store.get(file_name);
	request.onerror = function(event) {
		console.warn(event);
	};
	request.onsuccess = function(event) {
		console.info('????????? Get worked: ' + file_name);
		var blob = event.target.result;
		cb(blob);
	};
}

function setCachedFile(name, file_name, blob, cb) {
	var store = g_db.transaction(name, 'readwrite').objectStore(name);
	var request = store.put(blob, file_name);
	request.onerror = function(event) {
		console.warn(event);
	};
	request.onsuccess = function(event) {
		console.info('????????? Put worked: ' + file_name);
		cb();
	};
}

function setupCachedFiles() {
/*
	var req = indexedDB.deleteDatabase('ImageCache');
	req.onsuccess = function () {
		console.info('Deleted "ImageCache" database');
	};
*/

	var request = indexedDB.open('ImageCache', 1);
	request.onerror = function(event) {
		alert('Database error: '  + event.target.errorCode);
	};
	request.onsuccess = function(event) {
		console.info('Opening "ImageCache" database');
		g_db = event.target.result;
	};
	request.onupgradeneeded = function(event) {
		console.info('Creating/Upgrading "ImageCache" database');
		var db = event.target.result;
		var objectStore = db.createObjectStore('big', { autoIncrement : true });
		objectStore = db.createObjectStore('small', { autoIncrement : true });
	};
}

function startWorker() {
	g_worker = new Worker('js/worker.js');
	// FIXME: Instead of having this here, have the worker send a index variable
	var g_next_page_index = 0;

	g_worker.onmessage = function(e) {
		switch (e.data.action) {
			case 'uncompressed_start':
				g_next_page_index = 0;
				var count =  e.data.count;

				for (var i=0; i<count; ++i) {
					var img = document.createElement('img');
					img.id = 'page_' + i;
					img.title = 'No image loaded';
					img.className = 'comicImage';
					img.is_loaded = false;
					img.ondragstart = function() { return false; }
					img.onload = function() {
						if (g_needs_resize) {
							onResize(g_screen_width, g_screen_height);
						}
					};
					img.draggable = 'false';
					g_images.push(img);
				}
				break;
			case 'uncompressed_done':
				// FIXME: In Chrome, if the worker is terminated, all object URLs die
//				g_worker.terminate();
//				g_worker = null;

				g_image_index = 0;
				loadCurrentPage(function() {
					var width = $(window).width();
					var height = $(window).height();
					onResize(width, height);
				});
				break;
			case 'uncompressed_each':
				var url = e.data.url;
				var filename = e.data.filename;
				g_urls[g_next_page_index] = url;
				g_titles[g_next_page_index] = filename;

				if (g_next_page_index === 0) {
					loadCurrentPage(function() {
						var width = $(window).width();
						var height = $(window).height();
						onResize(width, height);
					});
				}

				g_next_page_index++;
				break;
			case 'invalid_file':
				onError(e.data.error);
				break;
/*
			case 'resize_image':
				var array_buffer = e.data.array_buffer;
				var filename = e.data.filename;
				var index = e.data.index;
				var blob = new Blob([array_buffer]);
				var url = URL.createObjectURL(blob);
				console.info('URL.createObjectURL: ' + url);
				var img = new Image();
				img.onload = function() {
					setTimeout(function() {
						URL.revokeObjectURL(url);
						console.info('URL.revokeObjectURL: ' + url);

						var ratio = 200.0 / img.width;
						var width = img.width * ratio;
						var height = img.height * ratio;
						var canvas = document.createElement('canvas');
						canvas.width = width;
						canvas.height = height;
						var ctx = canvas.getContext('2d');
						ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
						canvas.toBlob(function(small_blob) {
							setTimeout(function() {
								setCachedFile('small', filename, small_blob, function() {
									var smaller_url = URL.createObjectURL(small_blob);
									console.info('URL.createObjectURL: ' + smaller_url);
								});
							}, 100);
						});
					}, 100);
				};
				img.src = url;
				break;
*/
		}
	};

	// Start the worker
	var array_buffer = new ArrayBuffer(1);
	var message = {
		action: 'start',
		array_buffer: array_buffer
	};
	g_worker.postMessage(message, [array_buffer]);
	if (array_buffer.byteLength !== 0) {
		g_worker.terminate();
		g_worker = null;
		alert('Transferable Object are not supported!');
	}
}

$(document).ready(function() {
	g_page_left = $('#pageLeft');
	g_page_middle = $('#pageMiddle');
	g_page_right = $('#pageRight');

	// Stop the right click menu from popping up
	$(document).on('contextmenu', function(e) {
		e.preventDefault();
	});

	// Resize everything when the browser resizes
	$(window).resize(function() {
		var width = $(window).width();
		var height = $(window).height();
		onResize(width, height);
	});

	// Toggle full screen
	$('#btnFullScreen').click(function () {
		if (screenfull.enabled) {
			screenfull.toggle();
		}
	});

	// Open github in a new tab
	$('#btnOpenGithub').click(function () {
		var url = "https://github.com/workhorsy/comic_book_reader";
		window.open(url, '_blank');
	});

	// Open the file selection box
	$('#btnFileLoad').click(function() {
		$('#fileInput').click();
	});

	// Load the selected file
	$('#fileInput').change(function() {
		loadComic();
	});

	// Key press events
	$(document).keydown(onKeyPress);

	// Mouse events for the pages
	g_page_left.mousedown(onPageMouseDown);
	g_page_middle.mousedown(onPageMouseDown);
	g_page_right.mousedown(onPageMouseDown);

	// Mouse events for the body
	$('body').mousedown(onMouseDown);
	$('body').on('mouseup mouseleave', onMouseUp);
	$('body').mousemove(onMouseMove);

	// Mouse wheel events
	document.body.addEventListener('mousewheel', onMouseWheel, false);
	document.body.addEventListener('DOMMouseScroll', onMouseWheel, false);

	// Touch events
	document.body.addEventListener('touchstart', onTouchStart, false);
	document.body.addEventListener('touchend', onTouchEnd, false);
	document.body.addEventListener('touchcancel', ignoreEvent, false);
	document.body.addEventListener('touchmove', onTouchMove, false);

	// MS Pointer Events
	// FIXME: Touch dragging does not work in IE 11
	document.body.addEventListener('MSPointerDown', onPointerStart, false);
	document.body.addEventListener('MSPointerUp', onPointerEnd, false);
	document.body.addEventListener('MSPointerMove', onPointerMove, false);

	// Reset everything
	$('#comicPanel').hide();
	$(window).trigger('resize');
	clearComicData();
	setupCachedFiles();

	startWorker();
});
