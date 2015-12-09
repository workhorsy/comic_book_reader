Comic Book Reader
===================
* Can read CBR and CBZ files
* Runs right in the browser as a web page
* Works well on a touch device or desktop
* Stores comics in a library
* Is pure JavaScript and HTML
* Regularly tested in Firefox, Chrome, and Internet Explorer

# Bugs:
* If the first page is short, all the following pages get their bottom chopped off.
* cant touch scroll the page selector (chrome)
* touch scrolling all the way to the bottom does not work (firefox win 8)
* Multi touch input twitches the screen
* Touch movement is broken in IE11

# TODO Small:
* Make sure broken page images work
* Make sure broken archives work.
* Stop browser navigation when loading
* Add a place holder in the page selector, for images that have not loaded
* Make esc un full screen and bring down the top menu
* Add an effect when the up or down swipe is going to pull the menu instead of the page
* Have the right and left keys work like swiping right and left to turn pages
* Manga (left to right) support
* Remember previous page number when reloading files

# TODO Big:
* Move image resizing into workers
* Save dates all comics are opened on
* Pinch to zoom
* Add Tar support (cbt file)
* Add 7zip support (cb7 file)
* Loading files from Drop Box, Google Drive, et cetera
* Automatically identify comics using "perceptual image hashing"

# Browser limitations:
* Firefox and Chrome are 32bit, so they crash if they use more than 4
	gigs of ram.
* Restarting a web worker will corrupt all created Object URLs (chrome)
* Opening rar files is super slow in IE11 (because it uses Emscripten)
* Change from App Cache to Service Workers (when they work in all browsers)
* webkitRequestFullscreen does not expand the black body (chrome only)
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
