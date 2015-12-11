// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


function test_requirments() {
	var errors = [];
	if (typeof console === 'undefined') {
		errors.push('Web Worker Console');
	}
	if (typeof Blob === 'undefined') {
		errors.push('Web Worker Blob');
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

	if (errors.length > 0) {
		var message = {
			action: 'test_requirements',
			errors: errors
		};
		self.postMessage(message);
	}
}

self.addEventListener('message', function(e) {
	switch (e.data.action) {
		case 'test_requirements':
			//e.data.array_buffer = null;
			test_requirments();
			break;
	}
}, false);
