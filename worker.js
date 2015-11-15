// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


importScripts('libunrar.js');


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

function uncompress(filename, array_buffer) {
	var file = {};
	file.name = filename;
	file.size = array_buffer.byteLength;
	file.type = '';
	file.content = new Uint8Array(array_buffer);
	var files = [file];
	var password = null;
	readRARContent(files, password, function(fileName, fileSize, data) {
		if (! isValidImageType(fileName)) {
			return;
		}

		var buffer = new Blob([data.buffer], {type: 'image/jpeg'});
		console.info(fileName + ', ' + fileSize);
//			console.info(buffer);
		var url = URL.createObjectURL(buffer);
		console.info(url);

		var message = {
			action: 'uncompressed_image',
			filename: fileName,
			url: url
			//index: index
		};
		self.postMessage(message);
	}, function() {
		var message = {
			action: 'uncompressed_done'
		};
		self.postMessage(message);
		selc.close();
	});
}

self.addEventListener('message', function(e) {
	console.info(e);

	switch (e.data.action) {
		case 'uncompress':
			var array_buffer = e.data.array_buffer;
			var filename = e.data.filename;
			uncompress(filename, array_buffer);
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
