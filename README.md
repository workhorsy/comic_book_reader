Comic Book Reader
===================
* Can read CBR and CBZ files
* Runs right in the browser as a web page
* Works well on a touch device or desktop
* Is pure JavaScript and HTML
* Regularly tested in Firefox, Chrome, and Internet Explorer

# Limitations:
* There is no way to do swiping from screen edges yet in tablet browsers
* Different browsers use different combinations of mouse, touch, and
	pen events for input. So there is no way to tell what is really
	being used for input.

# Bugs:
* If the first page is short, all the following pages get their bottom chopped off.
* we don't need to load the first page again after all pages load.
* cant touch scroll the page selector (chrome)
* touch scrolling all the way to the bottom does not work (firefox win 8)
* Multi touch input twitches the screen
* Scroll bars do not reset position on page change
* Full screen does not make black wall paper show behind everything
* Touch movement is broken in IE11
* We cant restart web workers in Chrome without corrupting its object urls.
* Opening rar files is super slow in IE11

# TODO Small:
* Add an effect when the up or down swipe is going to pull the menu instead of the page
* Have the right and left keys work like swiping right and left to turn pages
* Add a warning if certain browser features are not present
* Add loading progress
* Turn image caching back on
* Make it work when 100% offline
* Manga (left to right) support
* Remember previous page number when reloading files

# TODO Big:
* Make thumb nailer faster by running in the web worker, and not using DOM
* Kinetic scrolling
* Add Tar support (cbt file)
* Add 7zip support (cb7 file)
* Having the pages 100% width is good for a tablet, but not a desktop
* Loading files from Drop Box, Google Drive, et cetera
* Automatically identify comics using "perceptual image hashing"
