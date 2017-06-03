// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

let g_db = null;

// FIXME: All the functions in this file are named inconsistently
function getAllCachedFirstPages(onStart, onEach) {
	let db_names = settings_get_db_names();
	onStart(db_names.length);

	let nextElement = function() {
		if (db_names.length <= 0) {
			return;
		}

		let m_db = null;
		let filename = db_names.shift();
		//console.info('!!!!!!!' + filename);
		let request = indexedDB.open(filename, 1);
		request.onerror = function(event) {
			console.error('Failed to open database for "'  + filename + '", :' + event.target.errorCode);
		};
		request.onupgradeneeded = function(event) {
			console.error('Database does not exist for "'  + filename + '".');
			event.target.transaction.abort();
			if (m_db) {
				m_db.close();
				m_db = null;
			}
			nextElement();
		};
		request.onsuccess = function(event) {
			console.info('Opening "'  + filename + '" database');
			m_db = event.target.result;

			let trans = m_db.transaction('small', IDBTransaction.READ_ONLY);
			let store = trans.objectStore('small');

			let countRequest = store.count();
			countRequest.onsuccess = function() {
				let count = countRequest.result;

				trans.oncomplete = function(evt) {
					m_db.close();
				};

				let cursorRequest = store.openCursor();

				cursorRequest.onerror = function(error) {
					console.error(error);
					m_db.close();
				};

				cursorRequest.onsuccess = function(evt) {
					let cursor = evt.target.result;

					// DB has files
					if (cursor) {
		//				console.info(cursor.key);
		//				console.info(cursor.value);
						onEach(filename, cursor.key, cursor.value);
					// DB has no files
					} else {
						onEach(filename, null, null);
					}

					trans.abort();
					m_db.close();
					nextElement();
				};
			};
		};
	};
	nextElement();
}

// FIXME: This only gets the size of the big pages.
// It needs to get the size of the small pages too.
function getTotalSize(onEnd) {
	let db_names = settings_get_db_names();
	let total_comics = db_names.length;
	let total_size = 0;
	let m_db = null;

	let nextElement = function() {
		if (db_names.length <= 0) {
			onEnd(total_size);
			return;
		}

		let filename = db_names.shift();
		let request = indexedDB.open(filename, 1);
		request.onerror = function(event) {
			console.error('Failed to open database for "'  + filename + '", :' + event.target.errorCode);
		};
		request.onupgradeneeded = function(event) {
			console.error('Database does not exist for "'  + filename + '".');
			event.target.transaction.abort();
			if (m_db) {
				m_db.close();
				m_db = null;
			}
			nextElement();
		};
		request.onsuccess = function(event) {
			m_db = event.target.result;
			total_size += filename.length;

			let trans = m_db.transaction('big', IDBTransaction.READ_ONLY);
			let store = trans.objectStore('big');

			let countRequest = store.count();
			countRequest.onsuccess = function() {
				let count = countRequest.result;

				trans.oncomplete = function(evt) {
					m_db.close();
					nextElement();
				};

				let cursorRequest = store.openCursor();

				cursorRequest.onerror = function(error) {
					console.error(error);
					m_db.close();
				};

				cursorRequest.onsuccess = function(evt) {
					let cursor = evt.target.result;
					if (cursor) {
						total_size += cursor.key.length;
						total_size += cursor.value.size;
						cursor.continue();
					}
				};
			};
		};
	};
	nextElement();
}

function getAllCachedPages(filename, onStart, onEach, onEnd) {
	let m_db = null;
	let request = indexedDB.open(filename, 1);
	request.onerror = function(event) {
		console.error('Failed to open database for "'  + filename + '", :' + event.target.errorCode);
	};
	request.onsuccess = function(event) {
		console.info('Opening "'  + filename + '" database');
		m_db = event.target.result;

		let trans = m_db.transaction('big', IDBTransaction.READ_ONLY);
		let store = trans.objectStore('big');

		let countRequest = store.count();
		countRequest.onsuccess = function() {
			let count = countRequest.result;
			onStart(count);

			trans.oncomplete = function(evt) {
				onEnd();
				m_db.close();
			};

			let cursorRequest = store.openCursor();

			cursorRequest.onerror = function(error) {
				console.error(error);
				m_db.close();
			};

			cursorRequest.onsuccess = function(evt) {
				let cursor = evt.target.result;
				if (cursor) {
	//				console.info(cursor.key);
	//				console.info(cursor.value);
					onEach(cursor.key, cursor.value);
					cursor.continue();
				}
			};
		};
	};
}

// FIXME: What do we do when this fails to write from lack of space?
function initCachedFileStorage(db_name, cb) {
	// Just return if already connected
	if (g_db) {
		cb();
		return;
	}

	let request = indexedDB.open(db_name, 1);
	request.onerror = function(event) {
		console.error('Failed to create database for "'  + db_name + '", :' + event.target.errorCode);
	};
	request.onsuccess = function(event) {
		console.info('Opening "'  + db_name + '" database');
		g_db = event.target.result;
		cb();
	};
	request.onupgradeneeded = function(event) {
		console.info('Creating/Upgrading "'  + db_name + '" database');
		let db = event.target.result;
		let objectStore = db.createObjectStore('big', { autoIncrement : true });
		objectStore = db.createObjectStore('small', { autoIncrement : true });
	};
}

function deleteCachedFileStorage(db_name, cb) {
	let req = indexedDB.deleteDatabase(db_name);
	req.onsuccess = function() {
		console.info('Deleted "' + db_name + '" database');
		cb();
	};
	req.onerror = function() {
		console.info('Failed to deleted "' + db_name + '" database');
		cb();
	};
}

function dbClose() {
	if (g_db) {
		g_db.close();
		g_db = null;
	}
}

function getCachedFile(name, file_name, cb) {
	let store = g_db.transaction(name, 'readwrite').objectStore(name);
	let request = store.get(file_name);
	request.onerror = function(event) {
		console.warn(event);
	};
	request.onsuccess = function(event) {
		//console.info('????????? Get worked: ' + name + ', ' + file_name);
		let blob = event.target.result;
		cb(blob);
	};
}

function setCachedFile(name, file_name, blob, cb) {
	let store = g_db.transaction(name, 'readwrite').objectStore(name);

	let request = null;
	try {
		request = store.put(blob, file_name);
	} catch (e) {
		dbClose();
//		console.error(e);
		if (e.name === 'QUOTA_EXCEEDED_ERR') {
			cb(false);
		}
	}

	request.onerror = function(event) {
//		console.error(event);
		cb(false);
	};
	request.onsuccess = function(event) {
		//console.info('????????? Put worked: ' + name + ', ' + file_name);
		cb(true);
	};
}
