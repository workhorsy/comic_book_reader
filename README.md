http://workhorsy.github.io/comic_book_reader

Comic Book Reader
===================
* Can read CBR, CBZ, and CBT files
* Runs in the browser as a JavaScript and HTML web page
* Works well on a touch device or desktop
* Saves opened comics in the browser
* Works when offline
* Regularly tested in Firefox, Chrome, and Internet Explorer

# Bugs:
* Checking for App Cache updates does not work (firefox only)
* Object URLS are silently corrupted after many pages are created (chrome only)
* Thumb nails are too small on a high dpi screen
* If the first page is short, all the following pages get their bottom chopped off
* cant touch scroll the page selector (chrome)
* Multi touch input twitches the screen

# TODO Mouse UI:
* Add the "Experimental" text to the background of the mouse UI mode.
* Errors do not show up.
* The prev and next buttons should be disabled when there is no comic loaded.
* Loading the second comic from the open menu, fails.
* When the UI clears all the data, it resets the UI to touch mode. Don't reset the UI mode.
* Add a library menu
* Add a page menu
* Add a zoom slider in the bottom right corner

# TODO Small:
* Add an option to disable user counter
* Stop browser navigation when loading
* Add a place holder in the page selector, for images that have not loaded
* Make esc un full screen and bring down the top menu
* Have the right and left keys work like swiping right and left to turn pages
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
* Firefox does not actually load an image, until it is on screen. This makes the right page apear to load lazily.
* Browsers have giant, ugly, non customizable full screen indicators.
* Firefox and Chrome are 32bit, so they crash if they use more than 4
	gigs of ram.
* Restarting a web worker will corrupt all created Object URLs (chrome)
* Opening rar files is super slow in IE11 (because it uses Emscripten)
* Change from App Cache to Service Workers (when they work in all browsers)
* webkitRequestFullscreen does not work the same as F11 full screen (chrome only)
* There is no way to do swiping from screen edges yet in tablet browsers
* There is no way to differentiate between mouse, touch, and pen input
	in different browsers.
* We will have to manually add Kinetic scrolling
* We have to run the thumb nailer in the main thread, which makes the UI
	unresponsive.
* There is no way to check how much free space is left in indexedDB.
* The indexedDB standard does not yet have a way to list all databases. Webkit
	does have indexedDB.webkitGetDatabaseNames though. So we work around this by
	storing their names in localStorage.
