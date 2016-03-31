// Copyright (c) 2016 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software uses a MIT style license
// https://github.com/SoftwareAddictionShow/no-more-jquery
//"use strict";

// Great website for reasons not to use jquery:
// http://youmightnotneedjquery.com

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.hidden { display: none !important; }';
document.getElementsByTagName('head')[0].appendChild(style);

function $one(selector) {
	return document.querySelector(selector);
}

function $all(selector) {
	return document.querySelectorAll(selector);
}

function hide(selector) {
	var elements = document.querySelectorAll(selector);
	for (var i=0; i<elements.length; ++i) {
    //console.error('hide: ', elements[i].id);
		//elements[i].classList.add('hidden');
    elements[i].style.display = 'none';
	}
}

function show(selector) {
	var elements = document.querySelectorAll(selector);
	for (var i=0; i<elements.length; ++i) {
    //console.error('show: ', elements[i].id);
		//elements[i].classList.remove('hidden');
    elements[i].style.display = 'block';
	}
}

function documentOnReady(cb) {
	if (document.readyState !== 'loading') {
		cb();
	} else {
		document.addEventListener('DOMContentLoaded', cb);
	}
}

function httpGet(url, cb, timeout) {
	httpRequest(url, 'GET', cb, timeout);
}

function httpPost(url, cb, timeout) {
	httpRequest(url, 'POST', cb, timeout);
}

function httpRequest(url, method, cb, timeout) {
	timeout = timeout || 3000;
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState === 4) {
			cb(this.response, this.status);
		} else if (this.readyState === 0) {
			cb(null);
		}
	};
	xhr.onerror = function() {
		cb(null);
	};
	xhr.open(method, url, true);
	xhr.timeout = timeout;
	xhr.send(null);
}

// FIXME: This stacks a new set of events for each animation call
// FIXME: Use a unique random number, rather than this global
var g_anim_counter = 0;
function animateCSS(element, start_fields, end_fields, duration, cb_on_end, iteration_count, direction) {
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
		console.info('animationstart', anim_name);
	}, false);
	element.addEventListener('animationend', function() {
		console.info('animationend', anim_name);
		if (style)
			document.getElementsByTagName('head')[0].removeChild(style);
		style = null;
		if (cb_on_end) cb_on_end();
	}, false);
	element.addEventListener('animationiteration', function() {
		console.info('animationiteration', anim_name);
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
