// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


importScripts('libunrar.js');
importScripts('jszip.js');



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

function uncompressRar(filename, array_buffer) {
	// Tell the client that we are starting to uncompress
	var onStart = function(fileNames) {
		var count = 0;
		for (var i=0; i<fileNames.length; ++i) {
			if (isValidImageType(fileNames[i].name)) {
				count++;
			}
		}

		var message = {
			action: 'uncompressed_start',
			count: count
		};
		self.postMessage(message);
	};

	// Uncompress each file and send it to the client
	var onEach = function(fileName, fileSize, data) {
		if (! isValidImageType(fileName)) {
			return;
		}

		var buffer = new Blob([data.buffer], {type: 'image/jpeg'});
//		console.info(buffer);
//		console.info(fileName + ', ' + fileSize);
//			console.info(buffer);
		var url = URL.createObjectURL(buffer);
		console.info(url);

		var message = {
			action: 'uncompressed_each',
			filename: fileName,
			url: url
			//index: index
		};
		self.postMessage(message);
	};

	// Tell the client that we are done uncompressing
	var onEnd = function() {
		var message = {
			action: 'uncompressed_done'
		};
		self.postMessage(message);
		// FIXME: In Chrome, if the worker is terminated, all object URLs die
//		self.close();
	};

	// Create an array of rar files
	var files = [{
		name: filename,
		size: array_buffer.byteLength,
		type: '',
		content: new Uint8Array(array_buffer)
	}];
	var password = null;

	// Decompress all the files
	readRARContent(files, password, onStart, onEach, onEnd);
}

function uncompressZip(filename, array_buffer) {
	var zip = new JSZip(array_buffer);

	// Get only the files that are images
	var files = [];
	Object.keys(zip.files).forEach(function(i) {
		var zipEntry = zip.files[i];
		if (isValidImageType(zipEntry.name)) {
			files.push(zipEntry);
		}
	});

	// Sort the files by name
	files.sort(function(a, b) {
		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;
	});

	// Tell the client that we are starting to uncompress
	var message = {
		action: 'uncompressed_start',
		count: files.length
	};
	self.postMessage(message);

	// Uncompress each file and send it to the client
	for (var i=0; i<files.length; ++i) {
		var zipEntry = files[i];
//		console.info(zipEntry);
		var buffer = zipEntry.asArrayBuffer();
		var blob = new Blob([buffer], {type: 'image/jpeg'});
		var url = URL.createObjectURL(blob);
		console.info(zipEntry.name);
		console.info(url);

		var message = {
			action: 'uncompressed_each',
			filename: zipEntry.name,
			url: url
			//index: index
		};
		self.postMessage(message);
	}

	// Tell the client that we are done uncompressing
	var message = {
		action: 'uncompressed_done'
	};
	self.postMessage(message);
}

function isRarFile(array_buffer) {
	// The two styles of RAR headers
	var rar_header1 = [0x52, 0x45, 0x7E, 0x5E].toString();
	var rar_header2 = [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00].toString();

	// Just return false if the file is smaller than the header
	if (array_buffer.byteLength < 7) {
		return false;
	}

	// Return true if the header matches one of the RAR headers
	var header1 = new Uint8Array(array_buffer).slice(0, 4).toString();
	var header2 = new Uint8Array(array_buffer).slice(0, 7).toString();
	return (header1 === rar_header1 || header2 === rar_header2);
}

function isZipFile(array_buffer) {
	// The ZIP header
	var zip_header = [0x50, 0x4b, 0x03, 0x04].toString();

	// Just return false if the file is smaller than the header
	if (array_buffer.byteLength < 4) {
		return false;
	}

	// Return true if the header matches the ZIP header
	var header = new Uint8Array(array_buffer).slice(0, 4).toString();
	return (header === zip_header);
}

self.addEventListener('message', function(e) {
	console.info(e);

	switch (e.data.action) {
		case 'uncompress':
			var array_buffer = e.data.array_buffer;
			var filename = e.data.filename.toLowerCase();

			// Open the file as rar
			if (isRarFile(array_buffer)) {
				console.info('Uncompressing RAR ...');
				uncompressRar(filename, array_buffer);
			// Open the file as zip
			} else if(isZipFile(array_buffer)) {
				console.info('Uncompressing Zip ...');
				uncompressZip(filename, array_buffer);
			// Otherwise show an error
			} else {
				var error = 'Invalid comic file: "' + filename + '"';
				console.info(error);
				var message = {
					action: 'invalid_file',
					error: error
				};
				self.postMessage(message);
			}
			break;
		case 'start':
			e.data.array_buffer = null;
			console.info('Worker started ...');
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
