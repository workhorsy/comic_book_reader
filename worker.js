// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


importScripts('unrar.min.js');

var g_unrar = null;
var g_entries = [];
var g_start = 0;
var g_incrementor = 0;

function isValidImageType(file_name) {
	file_name = file_name.toLowerCase();
	return file_name.endsWith('.jpeg') ||
			file_name.endsWith('.jpg') ||
			file_name.endsWith('.png') ||
			file_name.endsWith('.bmp');
}

function uncompress(e) {
	var array_buffer = e.data.array_buffer;
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

	uncompressEachImage(g_start);
}

function uncompressEachImage(i) {
	console.info(i + ', ' + g_entries.length);
	if (i >= g_entries.length) {
		g_unrar.close();
		g_unrar = null;
		return;
	}

	var entry = g_entries[i];
	var filename = entry.name;
	var data = g_unrar.decompress(filename);
	var blob = new Blob([data], {type: 'image/jpeg'});
	data = null;

	var reader = new FileReaderSync();
	var array_buffer = reader.readAsArrayBuffer(blob);
	blob = null;
	var message = {
		action: 'uncompressed_image',
		filename: filename,
		//index: index,
		array_buffer: array_buffer
	};
	self.postMessage(message, [array_buffer]);

	setTimeout(function() {
		uncompressEachImage(i + g_incrementor);
	}, 100);
}

self.addEventListener('message', function(e) {
	console.info(e);

	switch (e.data.action) {
		case 'uncompress':
			uncompress(e);
			break;
		case 'start':
			g_start = e.data.start;
			g_incrementor = e.data.incrementor;
			console.info('Worker started ...' + g_start);
			break;
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
	}
}, false);
