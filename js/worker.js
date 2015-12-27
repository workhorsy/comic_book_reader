// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

importScripts('polyfill/polyfill.js');
importScripts("libunrar.js");
importScripts("jszip.js");
importScripts("libuntar.js");
importScripts('uncompress.js');
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

function onUncompress(archive) {
	// Get only the entries that are images
	var entries = [];
	archive.entries.forEach(function(entry) {
		if (isValidImageType(entry.name)) {
			entries.push(entry);
		}
	});

	// Tell the client that we are starting to uncompress
	var onStart = function(entries) {
		var message = {
			action: 'uncompressed_start',
			count: entries.length
		};
		self.postMessage(message);
	};

	// Tell the client that we are done uncompressing
	var onEnd = function() {
		var message = {
			action: 'uncompressed_done'
		};
		self.postMessage(message);
	};

	// Uncompress each entry and send it to the client
	var onEach = function(i) {
		if (i === 0) {
			onStart(entries);
		} else if (i >= entries.length) {
			onEnd();
			return;
		}

		var entry = entries[i];
		entry.readData(function(data) {
			var blob = new Blob([data], {type: getFileMimeType(entry.name)});

			setCachedFile('big', entry.name, blob, function(is_success) {
				if (! is_success) {
					dbClose();
					var message = {
						action: 'storage_full',
						filename: entry.name
					};
					self.postMessage(message);
				} else {
					var message = {
						action: 'uncompressed_each',
						filename: entry.name,
						index: i,
						is_cached: false,
						is_last: i === entries.length - 1
					};
					self.postMessage(message);
					onEach(i + 1);
				}
			});
		});
	};
	onEach(0);
}

self.addEventListener('message', function(e) {
	console.info(e);

	// If the data posted is a file, monkey patch the action to be uncompress
	if (e.data instanceof File) {
		e.data.action = 'uncompress';
	}

	switch (e.data.action) {
		case 'uncompress':
			dbClose();

			// Convert the file data into an array buffer
			var reader = new FileReaderSync();
			var filename = e.data.name;
			var array_buffer = reader.readAsArrayBuffer(e.data);
			delete e.data;

			// Open the file as an archive
			var archive = archiveOpen(filename, array_buffer);
			if (archive) {
				initCachedFileStorage(filename, function() {
					console.info('Uncompressing ' + archive.archive_type + ' ...');
					onUncompress(archive);
				});
			// Otherwise show an error
			} else {
				var error = 'Invalid comic file: "' + filename + '"';
				console.info(error);
				var message = {
					action: 'invalid_file',
					error: error,
					filename: filename
				};
				self.postMessage(message);
			}

			break;
		// FIXME: Move this into a function called onLoadFromCache
		case 'load_from_cache':
			dbClose();
			var filename = e.data.filename;
			var length = 0;
			var onStart = function(count) {
				length = count;
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
				console.info(name);

				var message = {
					action: 'uncompressed_each',
					filename: name,
					index: i,
					is_cached: true,
					is_last: i === length - 1
				};
				self.postMessage(message);
				i++;
			};

			getAllCachedPages(filename, onStart, onEach, onEnd);
			break;
		case 'start':
			console.info('Worker started ...');
			break;
		case 'stop':
			console.info('Worker stopped ...');
			self.close();
			break;
	}
}, false);
