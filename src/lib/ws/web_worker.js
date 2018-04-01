// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

importScripts('polyfill.js');
importScripts('uncompress.js');
importScripts('settings.js');
importScripts('db.js');

loadArchiveFormats(['rar', 'zip', 'tar']);

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
	let entries = [];
	archive.entries.forEach(function(entry) {
		if (isValidImageType(entry.name)) {
			entries.push(entry);
		}
	});

	// Show an error if there are no images
	if (entries.length === 0) {
		let error = L('Archive contains no images.');
		let message = {
			action: 'invalid_file',
			error: error,
			filename: archive.file_name
		};
		self.postMessage(message);
		return;
	}

	// Tell the client that we are starting to uncompress
	let onStart = function(entries) {
		let message = {
			action: 'uncompressed_start',
			count: entries.length
		};
		self.postMessage(message);
	};

	// Tell the client that we are done uncompressing
	let onEnd = function() {
		let message = {
			action: 'uncompressed_done'
		};
		self.postMessage(message);
	};

	// Uncompress each entry and send it to the client
	let onEach = function(i) {
		if (i === 0) {
			onStart(entries);
		}
		if (i >= entries.length) {
			onEnd();
			return;
		}

		let entry = entries[i];
		entry.readData(function(data, err) {
			let blob = new Blob([data], {type: getFileMimeType(entry.name)});

			setCachedFile('big', entry.name, blob, function(is_success) {
				if (! is_success) {
					dbClose();
					let message = {
						action: 'storage_full',
						filename: entry.name
					};
					self.postMessage(message);
				} else {
					let message = {
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
	//console.info(e);

	// If the data posted is a file, monkey patch the action to be uncompress
	if (e.data instanceof File) {
		e.data.action = 'uncompress';
	}

	let filename = '';

	switch (e.data.action) {
		case 'uncompress':
			dbClose();

			// Convert the file data into an array buffer
			let reader = new FileReaderSync();
			filename = e.data.name;
			let array_buffer = reader.readAsArrayBuffer(e.data);
			delete e.data;

			// Open the file as an archive
			try {
				let archive = archiveOpenArrayBuffer(filename, array_buffer);
				initCachedFileStorage(filename, function() {
					console.info('Uncompressing ' + archive.archive_type + ' ...');
					onUncompress(archive);
				});
			// Otherwise show an error
			} catch (e) {
				console.info(e);
				let message = {
					action: 'invalid_file',
					error: e.message,
					filename: filename
				};
				self.postMessage(message);
			}

			break;
		// FIXME: Move this into a function called onLoadFromCache
		case 'load_from_cache':
			dbClose();
			filename = e.data.filename;
			let length = 0;
			let onStart = function(count) {
				length = count;
				let message = {
					action: 'uncompressed_start',
					count: count
				};
				self.postMessage(message);
			};

			let onEnd = function() {
				let message = {
					action: 'uncompressed_done'
				};
				self.postMessage(message);
			};

			let i = 0;
			let onEach = function(name, blob) {
				//console.info(name);

				let message = {
					action: 'uncompressed_each',
					filename: name,
					index: i,
					is_cached: true,
					is_last: i === length - 1
				};
				self.postMessage(message);
				i++;
			};

			// FIXME: This should not need to load all pages on start
			getAllCachedPages(filename, onStart, onEach, onEnd);
			break;
		case 'start':
			console.info('Web Worker started ...');
			break;
		case 'stop':
			console.info('Web Worker stopped ...');
			self.close();
			break;
	}
}, false);
