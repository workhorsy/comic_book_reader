// Copyright (c) 2015 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under GPL v3 or later
// http://github.com/workhorsy/comic_book_reader


self.addEventListener('message', function(e) {
	console.info(e);

	switch (e.data.action) {
		case 'start':
			console.info('Worker started ...');
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
