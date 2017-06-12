// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under AGPL v3 or later
// http://github.com/workhorsy/comic_book_reader
"use strict";

let g_worker = null;

function killWorker() {
	if (g_worker) {
		g_worker.terminate();
		g_worker = null;
	}
}

function stopWorker() {
	let message = {
		action: 'stop'
	};
	g_worker.postMessage(message);
	g_worker = null;
}

function startWorker() {
	g_worker = new Worker('js/web_worker.js');

	g_worker.onmessage = function(e) {
		if (g_is_terminated) {
			return;
		}

		let filename = "";
		let index = -1;

		switch (e.data.action) {
			case 'storage_full':
				filename = e.data.filename;
				onStorageFull(filename);
				break;
			case 'uncompressed_start':
				// Update the progress
				g_image_count =  e.data.count;
				$('#loadingProgress').innerHTML = 'Loading 0.0% ...';
				show('#loadingProgress');

				// Create empty pages to hold all the images
				let container = $('#horizontalScroller');
				for (let i = 0; i < g_image_count; ++i) {
					let page = document.createElement('div');
					page.className = 'verticalScroller unselectable';
					container.appendChild(page);
				}
				break;
			case 'uncompressed_done':
				$('#comicPanel').scrollLeft = 0;
				overlayShow();
				break;
			case 'uncompressed_each':
				filename = e.data.filename;
				index = e.data.index;
				let is_cached = e.data.is_cached;
				let is_last = e.data.is_last;

				g_titles[index] = filename;

				$('#loadingProgress').innerHTML = 'Loading ' + ((index / (g_image_count - 1)) * 100.0).toFixed(1) + '% ...';

				makePagePreview(filename, is_cached, function() {
					// Load the image into the page
					let container = $('#horizontalScroller');
					let page = container.children[index];
					loadImage(page, index, function() {
						//
					});

					if (is_last) {
						stopWorker();

						hide('#loadingProgress');
						$('#loadingProgress').innerHTML = '';
						$('#btnFileLoad').disabled = false;
						$('#btnLibrary').disabled = false;
						$('#btnSettings').disabled = false;

						startWorker();
					}
				});
				break;
			case 'invalid_file':
				filename = e.data.filename;

				dbClose();

				// Remove the file db
				deleteCachedFileStorage(filename, function() {

				});

				// Remove the file name from list of dbs
				let db_names = settings_get_db_names();
				index = db_names.indexOf(filename);
				if (index !== -1) {
					db_names.splice(index, 1);
					settings_set_db_names(db_names);
				}

				onError(e.data.error);
				break;
		}
	};

	// Start the worker
	let message = {
		action: 'start'
	};
	g_worker.postMessage(message);

}

function makePagePreview(filename, is_cached, cb) {
	if (! is_cached) {
		getCachedFile('big', filename, function(blob) {
			let url = URL.createObjectURL(blob);
			//console.log('>>>>>>>>>>>>>>>>>>> createObjectURL: ' + url + ', ' + filename);

			let img = new Image();
			img.onload = function() {
				if (url) {
					URL.revokeObjectURL(url);
					//console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
					url = null;
				}

				let ratio = 400.0 / img.width;
				let width = img.width * ratio;
				let height = img.height * ratio;

				resizeImage(img, width, height, g_use_higher_quality_previews, function(small_blob) {
					img.src = '';
					setCachedFile('small', filename, small_blob, function(is_success) {
						if (! is_success) {
							onStorageFull(filename);
						}
						if (cb) {
							cb();
							cb = null;
						}
					});
				});
			};
			img.onerror = function(e) {
				if (url) {
					URL.revokeObjectURL(url);
					//console.log('<<<<<<<<<<<<<<<<<<<< revokeObjectURL: ' + url);
					url = null;
				}

				if (cb) {
					cb();
					cb = null;
				}
			};
			img.src = url;
		});
	} else {
		if (cb) {
			cb();
			cb = null;
		}
	}
}

function loader_load_file(blob, filename) {
	let db_names = settings_get_db_names();
	let has_file = db_names.includes(filename);

	// If the file is cached, load it from the cache
	if (has_file) {
		initCachedFileStorage(filename, function() {
			let message = {
				action: 'load_from_cache',
				filename: filename
			};
			g_worker.postMessage(message);
		});
	// If the file is not cached, send it to the worker to be decompressed
	} else {
		// Save the name of the comic to the cache
		initCachedFileStorage(filename, function() {
			let db_names = settings_get_db_names();
			if (! db_names.includes(filename)) {
				db_names.push(filename);
				settings_set_db_names(db_names);
			}

			let fileReader = new FileReader();
			fileReader.onload = function() {
				let array_buffer = this.result;
				if (isPdfFile(array_buffer)) {
					onPDF(array_buffer);
				} else {
					g_worker.postMessage(blob);
				}
			};
			fileReader.readAsArrayBuffer(blob);
		});
	}
}

function onPDF(blob) {
	document.body.innerHTML = '';
	PDFJS.getDocument(blob).then(function(pdf_doc) {
		//console.log(pdf_doc);
		pdf_doc.getPage(3).then(function(page) {
			//console.log(page);
			let viewport = page.getViewport(1);

			let canvas = document.createElement('canvas');
			canvas.style.border = "2px solid red";
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			//document.body.appendChild(canvas);

			let renderContext = {
					canvasContext: canvas.getContext('2d'),
					viewport: viewport
			};
			page.render(renderContext).then(function() {
				let image = new Image();
				image.src = canvas.toDataURL("image/png");
				document.body.appendChild(image);
			});
		});
	});	
}

function isPdfFile(array_buffer) {
	// The PDF header
	var pdf_header = saneJoin([0x25, 0x50, 0x44, 0x46], ', ');

	// Just return false if the file is smaller than the header
	if (array_buffer.byteLength < 4) {
		return false;
	}

	// Return true if the header matches the PDF header
	var header = saneJoin(new Uint8Array(array_buffer).slice(0, 4), ', ');
	return (header === pdf_header);
}
