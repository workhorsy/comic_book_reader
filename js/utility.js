// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";


function hasTouchSupport() {
	return 'ontouchstart' in window || navigator.MaxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

function diff(a, b) {
	return a > b ? (a-b) : (b-a);
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
		return L('None');
	}

	return '?';
}

function imageToCanvas(img, width, height) {
	let canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	let ctx = canvas.getContext('2d');
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
	ctx.msImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
	return canvas;
}

function resizeImage(img, width, height, use_higher_quality, cb, type, quality) {
	if (! use_higher_quality) {
		let source = imageToCanvas(img, width, height);
		source.toBlob(function(small_blob) {
			cb(small_blob);
		}, type, quality);
	} else {
		let source = imageToCanvas(img, img.width, img.height);

		let dest = document.createElement('canvas');
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
				}, type, quality);
			}
		);
	}
}

//https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
function toggleFullScreen() {
	if (!document.fullscreenElement &&
		!document.mozFullScreenElement &&
		!document.webkitFullscreenElement &&
		!document.msFullscreenElement) {
		console.info('Calling full screen ................');
		if (document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen();
		} else if (document.documentElement.msRequestFullscreen) {
			document.documentElement.msRequestFullscreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullscreen) {
			document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		console.info('Calling exit full screen ................');
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}
