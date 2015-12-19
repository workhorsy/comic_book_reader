// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

function test_requirments() {
	var errors = [];
	if (typeof console === 'undefined') {
		errors.push('Web Worker Console');
	}
	if (typeof Blob === 'undefined') {
		errors.push('Web Worker Blob');
	}
	if (typeof Object === 'undefined' || typeof Object.defineProperty === 'undefined') {
		errors.push('Object defineProperty');
	}
	if (typeof Object === 'undefined' || typeof Object.hasOwnProperty === 'undefined') {
		errors.push('Object hasOwnProperty');
	}
	if (typeof Uint8Array === 'undefined') {
		errors.push('Web Worker Uint8Array');
	}
	if (typeof indexedDB === 'undefined') {
		errors.push('Web Worker Indexed DB');
	}
	if (typeof URL === 'undefined' || typeof URL.createObjectURL === 'undefined') {
		errors.push('Web Worker Create Object URL');
	}
	if (typeof URL === 'undefined' || typeof URL.revokeObjectURL === 'undefined') {
		errors.push('Web Worker Revoke Object URL');
	}
	if (typeof JSON === 'undefined' || typeof JSON.stringify === 'undefined') {
		errors.push('Web Worker JSON Stringify');
	}
	if (typeof JSON === 'undefined' || typeof JSON.parse === 'undefined') {
		errors.push('Web Worker JSON Parse');
	}
	if (typeof FileReaderSync === 'undefined') {
		errors.push('Web Worker File Reader Sync');
	}

	var message = {
		action: 'test_requirements',
		errors: errors
	};
	self.postMessage(message);
}

self.addEventListener('message', function(e) {
	switch (e.data.action) {
		case 'test_requirements':
			test_requirments();
			break;
	}
}, false);
