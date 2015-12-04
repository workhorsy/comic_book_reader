// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


importScripts('polyfill/polyfill.js');
importScripts('libunrar.js');
importScripts('jszip.js');
importScripts('settings.js');
importScripts('db.js');


function isValidImageType(file_name) {
	file_name = file_name.toLowerCase();
	return file_name.endsWith('.jpeg') ||
			file_name.endsWith('.jpg') ||
			file_name.endsWith('.png') ||
			file_name.endsWith('.bmp') ||
			file_name.endsWith('.gif');
}

function getFileMimeType(file_name) {
	file_name = file_name.toLowerCase();
	if (file_name.endsWith('.jpeg') || file_name.endsWith('.jpg')) {
		return 'image/jpeg';
	} else if (file_name.endsWith('.png')) {
		return 'image/png';
	} else if (file_name.endsWith('.bmp')) {
		return 'image/bmp';
	} else if (file_name.endsWith('.gif')) {
		return 'image/gif';
	} else {
		// Uses jpeg as default mime type
		return 'image/jpeg';
	}
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
	var onEach = function(index, fileName, fileSize, data) {
		if (! isValidImageType(fileName)) {
			return;
		}

		var blob = new Blob([data.buffer], {type: getFileMimeType(fileName)});
//		console.info(blob);
//		console.info(fileName + ', ' + fileSize);
//			console.info(blob);
		var url = URL.createObjectURL(blob);
		console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);

		var message = {
			action: 'uncompressed_each',
			filename: fileName,
			url: url,
			index: index,
			is_cached: false
		};
		self.postMessage(message);

		setCachedFile('big', fileName, blob, function() {

		});
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

	var onEach = function(files, i) {
		// First file
		if (i === 0) {
			// Tell the client that we are starting to uncompress
			var message = {
				action: 'uncompressed_start',
				count: files.length
			};
			self.postMessage(message);
		// Last file
		} else if (i >= files.length) {
			// Close the connection to indexedDB
			dbClose();

			// Tell the client that we are done uncompressing
			var message = {
				action: 'uncompressed_done'
			};
			self.postMessage(message);
			return;
		}

		var zipEntry = files[i];
		var filename = zipEntry.name;
		//console.info(zipEntry);
		var buffer = zipEntry.asArrayBuffer();
		var blob = new Blob([buffer], {type: getFileMimeType(filename)});
		var url = URL.createObjectURL(blob);
		console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
		console.info(filename);
		console.info(url);

		setCachedFile('big', filename, blob, function() {
			var message = {
				action: 'uncompressed_each',
				filename: filename,
				url: url,
				index: i,
				is_cached: false
			};
			self.postMessage(message);

			onEach(files, i + 1);
		});
	};

	// Uncompress each file and send it to the client
	onEach(files, 0);
}

function isRarFile(array_buffer) {
	// The two styles of RAR headers
	var rar_header1 = [0x52, 0x45, 0x7E, 0x5E].join(', ');
	var rar_header2 = [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00].join(', ');

	// Just return false if the file is smaller than the header
	if (array_buffer.byteLength < 7) {
		return false;
	}

	// Return true if the header matches one of the RAR headers
	var header1 = new Uint8Array(array_buffer).slice(0, 4).join(', ');
	var header2 = new Uint8Array(array_buffer).slice(0, 7).join(', ');
	return (header1 === rar_header1 || header2 === rar_header2);
}

function isZipFile(array_buffer) {
	// The ZIP header
	var zip_header = [0x50, 0x4b, 0x03, 0x04].join(', ');

	// Just return false if the file is smaller than the header
	if (array_buffer.byteLength < 4) {
		return false;
	}

	// Return true if the header matches the ZIP header
	var header = new Uint8Array(array_buffer).slice(0, 4).join(', ');
	return (header === zip_header);
}

self.addEventListener('message', function(e) {
	console.info(e);

	switch (e.data.action) {
		case 'uncompress':
			var array_buffer = e.data.array_buffer;
			var filename = e.data.filename;

			initCachedFileStorage(filename, function() {
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
			});
			break;
		case 'load_from_cache':
			var filename = e.data.filename;
			var onStart = function(count) {
				var message = {
					action: 'uncompressed_start',
					count: count
				};
				self.postMessage(message);
			};

			var onEnd = function() {
				var message = {
					action: 'uncompressed_done'
				};
				self.postMessage(message);
			};

			var i = 0;
			var onEach = function(name, blob) {
				var url = URL.createObjectURL(blob);
				console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url);
				console.info(name);
				console.info(url);

				var message = {
					action: 'uncompressed_each',
					filename: name,
					url: url,
					index: i,
					is_cached: true
				};
				self.postMessage(message);
				i++;
			};

			getAllCachedPages(filename, onStart, onEach, onEnd);
			break;
		case 'start':
			e.data.array_buffer = null;
			console.info('Worker started ...');
			break;
	}
}, false);
