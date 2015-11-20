Comic Book Reader
===================

# Limitations
* There is no way to do swiping from screen edges yet in browsers

# Bugs:
* The scroll needs to be reset when going to a page from thumb nails
* Going to the next page from a thumbnail does not always work
* mouse wheel scrolling does not work on the bottom panel
* Sometimes the 3rd page gets removed?
* pulling the top menu down is jerky in chrome
* Multi touch input twitches the screen
* Scroll bars do not reset position on page change
* Full screen does not make black wall paper show behind everything
* Touch movement is broken in IE11
* We cant restart web workers in Chrome without corrupting its object urls.
* Opening rar files is super slow in IE11

# TODO Small:
* Add loading progress
* Turn image caching back on
* Make it work when 100% offline
* Manga (left to right) support
* Remember previous page number when reloading files

# TODO Big:
* Add a swipe up menu for page selection, with thumbnails
* Make thumb nailer faster by running in the web worker, and not using DOM
* Kinetic scrolling
* Add Tar support (cbt file)
* Add 7zip support (cb7 file)
* Having the pages 100% width is good for a tablet, but not a desktop
* Loading files from Drop Box, Google Drive, et cetera
* Automatically identify comics using "perceptual image hashing"
