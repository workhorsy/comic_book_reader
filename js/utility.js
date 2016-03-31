// Copyright (c) 2016 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
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
		return 'None';
	}

	return '?';
}

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

var g_anim_counter = 0;
function animateCSS(element, start_fields, end_fields, duration, iteration_count, direction) {
	iteration_count = iteration_count || 1;
	direction = direction || 'normal';
	var anim_name = 'anim_' + (++g_anim_counter);

	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = "\
	." + anim_name + " {\
		animation-duration: " + duration + ";\
		animation-name: " + anim_name + ";\
		animation-iteration-count: " + iteration_count + ";\
		animation-direction: " + direction + ";\
	}\
	@keyframes " + anim_name + " {\
		from {\
			" + start_fields + "\
		}\
	}\
	@keyframes " + anim_name + " {\
		to {\
			" + end_fields + "\
		}\
	}";
	document.getElementsByTagName('head')[0].appendChild(style);

	element.addEventListener('animationstart', function() {
		console.info('animationstart');
	}, false);
	element.addEventListener('animationend', function() {
		console.info('animationend');
		document.getElementsByTagName('head')[0].removeChild(style);
	}, false);
	element.addEventListener('animationiteration', function() {
		console.info('animationiteration');
	}, false);
	element.className = anim_name;
}

function animateValue(cb, old_value, new_value, target_time) {
	var is_bigger = old_value > new_value;
	var diff_value = is_bigger ? old_value - new_value : new_value - old_value;
	var start_time = null;

	var stepTime = function(timestamp) {
		if (start_time === null) {
			start_time = timestamp;
		}
		var elapsed_time = timestamp - start_time;
		var percent = elapsed_time / target_time;
		if (percent >= 1.0) {
			percent = 1.0;
		}

		var trans_value = 0;
		if (is_bigger) {
			trans_value = old_value - (diff_value * percent);
		} else {
			trans_value= old_value + (diff_value * percent);
		}
		cb(trans_value);
		if (percent !== 1.0) {
			window.requestAnimationFrame(stepTime);
		}
	};
	window.requestAnimationFrame(stepTime);
}
