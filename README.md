http://comic-book-reader.com

Comic Book Reader
===================
* Can read CBR, CBZ, and CBT files
* Runs in the browser as a JavaScript and HTML web page
* Works well on a touch device or desktop
* Saves opened comics in the browser
* ~~Works when offline~~. This has been temporarily tuned off, because AppCache is broken on Firefox.
* Regularly tested in Firefox, Chrome, and Internet Explorer


# Bugs:
* CSS animations stack on the page number overlay

# TODO Small:
* Stop browser navigation when loading
* Make esc un full screen and bring down the top menu
* Remember previous page number when reloading files

# TODO Big:
* Dark theme for night reading
* Save dates all comics are opened on
* Loading files from Drop Box, Google Drive, et cetera

# Browser limitations:
* Firefox does not actually load an image, until it is on screen. This makes the
	right page appear to load lazily.
