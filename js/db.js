// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


var g_db = null;

// FIXME: All the functions in this file are named inconsistently
function getAllCachedFirstPages(onStart, onEach) {
	var db_names = dbGetAllComicNames();
	onStart(db_names.length);

	var nextElement = function() {
		if (db_names.length <= 0) {
			return;
		}

		var filename = db_names.shift();
		console.info('!!!!!!!' + filename);
		var request = indexedDB.open(filename, 1);
		request.onerror = function(event) {
			console.error('Failed to open database for "'  + filename + '", :' + event.target.errorCode);
		};
		request.onupgradeneeded = function(event) {
			console.error('Database does not exist for "'  + filename + '".');
			event.target.transaction.abort();
			m_db.close();
			nextElement();
		};
		request.onsuccess = function(event) {
			console.info('Opening "'  + filename + '" database');
			m_db = event.target.result;

			var trans = m_db.transaction('small', IDBTransaction.READ_ONLY);
			var store = trans.objectStore('small');

			var countRequest = store.count();
			countRequest.onsuccess = function() {
				var count = countRequest.result;

				trans.oncomplete = function(evt) {
					m_db.close();
				};

				var cursorRequest = store.openCursor();

				cursorRequest.onerror = function(error) {
					console.error(error);
					m_db.close();
				};

				cursorRequest.onsuccess = function(evt) {
					var cursor = evt.target.result;
					if (cursor) {
		//				console.info(cursor.key);
		//				console.info(cursor.value);
						onEach(filename, cursor.key, cursor.value);
						trans.abort();
						m_db.close();
						nextElement();
					}
				};
			};
		};
	};
	nextElement();
}

function getAllCachedPages(filename, onStart, onEach, onEnd) {
	var request = indexedDB.open(filename, 1);
	request.onerror = function(event) {
		console.error('Failed to open database for "'  + filename + '", :' + event.target.errorCode);
	};
	request.onsuccess = function(event) {
		console.info('Opening "'  + filename + '" database');
		m_db = event.target.result;

		var trans = m_db.transaction('big', IDBTransaction.READ_ONLY);
		var store = trans.objectStore('big');

		var countRequest = store.count();
		countRequest.onsuccess = function() {
			var count = countRequest.result;
			onStart(count);

			trans.oncomplete = function(evt) {
				onEnd();
				m_db.close();
			};

			var cursorRequest = store.openCursor();

			cursorRequest.onerror = function(error) {
				console.error(error);
				m_db.close();
			};

			cursorRequest.onsuccess = function(evt) {
				var cursor = evt.target.result;
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

function initCachedFileStorage(db_name, cb) {
	var request = indexedDB.open(db_name, 1);
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
		var db = event.target.result;
		var objectStore = db.createObjectStore('big', { autoIncrement : true });
		objectStore = db.createObjectStore('small', { autoIncrement : true });
	};
}

function dbClose() {
	if (g_db) {
		g_db.close();
		g_db = null;
	}
}

function getCachedFile(name, file_name, cb) {
	var store = g_db.transaction(name, 'readwrite').objectStore(name);
	var request = store.get(file_name);
	request.onerror = function(event) {
		console.warn(event);
	};
	request.onsuccess = function(event) {
		console.info('????????? Get worked: ' + file_name);
		var blob = event.target.result;
		cb(blob);
	};
}

function setCachedFile(name, file_name, blob, cb) {
	var store = g_db.transaction(name, 'readwrite').objectStore(name);
	var request = store.put(blob, file_name);
	request.onerror = function(event) {
		console.warn(event);
	};
	request.onsuccess = function(event) {
		console.info('????????? Put worked: ' + file_name);
		cb();
	};
}
