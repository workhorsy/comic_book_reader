// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


importScripts('unrar.min.js');

var g_unrar = null;
var g_entries = [];
var g_start = 0;
var g_incrementor = 0;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}

function isValidImageType(file_name) {
	file_name = file_name.toLowerCase();
	return file_name.endsWith('.jpeg') ||
			file_name.endsWith('.jpg') ||
			file_name.endsWith('.png') ||
			file_name.endsWith('.bmp');
}

function uncompress(array_buffer) {
	g_unrar = new Unrar(array_buffer);
	var entries = g_unrar.getEntries();

	// Get only the entries that are valid images
	g_entries = [];
	entries.forEach(function(entry) {
		if (! entry.directory && isValidImageType(entry.name)) {
			g_entries.push(entry);
		}
	});

	// Sort the entries by their file names
	g_entries.sort(function(a, b){
		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;
	});

	setTimeout(function() {
		uncompressEachImage(g_start);
	}, 100);
}

function uncompressEachImage(i) {
	console.info(i + ', ' + g_entries.length);

	// If there are no more entries, stop the worker
	if (i >= g_entries.length) {
		g_unrar.close();
		g_unrar = null;
		g_entries = null;

		var message = {
			action: 'uncompressed_done'
		};
		self.postMessage(message);
		self.close();

	// If there are more entries, uncompress the file
	} else {
		var filename = g_entries[i].name;
		var data = g_unrar.decompress(filename).buffer;
		var blob = new Blob([data], {type: 'image/jpeg'});
		data = null;
		var url = URL.createObjectURL(blob);
		blob = null;

		var message = {
			action: 'uncompressed_image',
			filename: filename,
			url: url
			//index: index
		};
		self.postMessage(message);

		setTimeout(function() {
			uncompressEachImage(i + g_incrementor);
		}, 100);
	}
}

self.addEventListener('message', function(e) {
	console.info(e);

	switch (e.data.action) {
		case 'uncompress':
			var array_buffer = e.data.array_buffer;
			uncompress(array_buffer);
			break;
		case 'start':
			g_start = e.data.start;
			g_incrementor = e.data.incrementor;
			e.data.array_buffer = null;
			console.info('Worker started ...' + g_start);
			break;
/*
		case 'resize_image':
			var index = e.data.index;
			var filename = e.data.filename;
			var array_buffer = e.data.array_buffer;

			// FIXME: Resize the buffer here, and return it
			//var uInt8Array = new Uint8Array(array_buffer);

			var message = {
				action: 'resize_image',
				filename: filename,
				index: index,
				array_buffer: array_buffer
			};
			self.postMessage(message, [array_buffer]);
			break;
*/
	}
}, false);
