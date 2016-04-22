http://comic-book-reader.com

Comic Book Reader
===================
* Can read CBR, CBZ, and CBT files
* Runs in the browser as a JavaScript and HTML web page
* Works well on a touch device or desktop
* Saves opened comics in the browser
* Works when offline
* Regularly tested in Firefox, Chrome, and Internet Explorer


# Bugs:
* CSS animations stack on the page number overlay
* Checking for App Cache updates does not work (firefox only)
* Object URLS are silently corrupted after many pages are created (chrome only)

# TODO Small:
* Add an overlay with directions for where to tap
* Add an option to disable user counter
* Stop browser navigation when loading
* Make esc un full screen and bring down the top menu
* Manga (left to right) support
* Remember previous page number when reloading files

# TODO Big:
* Dark theme for night reading
* Before decompressing, check indexedDB to see if we have enough free space
* Move image resizing into workers
* Save dates all comics are opened on
* Pinch to zoom
* Add 7zip support (cb7 file)
* Loading files from Drop Box, Google Drive, et cetera
* Automatically identify comics using "perceptual image hashing"

# Browser limitations:
* There is no way to detect out of memory errors. It just prints them to console.
* Firefox does not actually load an image, until it is on screen. This makes the
	right page appear to load lazily.
* Browsers have giant, ugly, non customizable full screen indicators.
* 32bit browsers can run out of ram, when loading comics.
* Restarting a web worker will corrupt all created Object URLs (chrome)
* Opening rar files is super slow in IE11 (because it uses Emscripten)
* Change from App Cache to Service Workers (when they work in all browsers)
* webkitRequestFullscreen does not work the same as F11 full screen (chrome only)
* We have to run the thumb nailer in the main thread, which makes the UI
	unresponsive.
* There is no way to check how much free space is left in indexedDB.
* The indexedDB standard does not yet have a way to list all databases. Webkit
	does have indexedDB.webkitGetDatabaseNames though. So we work around this by
	storing their names in localStorage.
