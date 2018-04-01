//https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
export function toggleFullScreen() {
	if (!document.fullscreenElement &&
		!document.mozFullScreenElement &&
		!document.webkitFullscreenElement &&
		!document.msFullscreenElement) {
		console.info('Calling full screen ................');
		if (document.documentElement.requestFullscreen) {
			document.documentElement.requestFullscreen();
		} else if (document.documentElement.msRequestFullscreen) {
			document.documentElement.msRequestFullscreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullscreen) {
			document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	} else {
		console.info('Calling exit full screen ................');
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}
	}
}


// Show an error message if any required browser features are missing
export function requireBrowserFeatures(cb) {
	let errors = [];
	if ( !('transform' in document.body.style)) {
		errors.push('CSS transform');
	}
	if (typeof Blob === 'undefined') {
		errors.push('Blob');
	}
	if (typeof Object === 'undefined' || typeof Object.defineProperty === 'undefined') {
		errors.push('Object defineProperty');
	}
	if (typeof Object === 'undefined' || typeof Object.hasOwnProperty === 'undefined') {
		errors.push('Object hasOwnProperty');
	}
	if (typeof window.HTMLCanvasElement === 'undefined' ||
		typeof window.HTMLCanvasElement.prototype.getContext === 'undefined') {
		errors.push('Canvas Context');
	}
	if (typeof Uint8Array === 'undefined') {
		errors.push('Uint8Array');
	}
	if (typeof indexedDB === 'undefined') {
		errors.push('Indexed DB');
	}
	if (typeof localStorage === 'undefined') {
		errors.push('Local Storage');
	}
	if (typeof Worker === 'undefined') {
		errors.push('Web Worker');
	}
	if (typeof URL === 'undefined' || typeof URL.createObjectURL === 'undefined') {
		errors.push('Create Object URL');
	}
	if (typeof URL === 'undefined' || typeof URL.revokeObjectURL === 'undefined') {
		errors.push('Revoke Object URL');
	}
	if (typeof JSON === 'undefined' || typeof JSON.stringify === 'undefined') {
		errors.push('JSON Stringify');
	}
	if (typeof JSON === 'undefined' || typeof JSON.parse === 'undefined') {
		errors.push('JSON Parse');
	}
	if (typeof FileReader === 'undefined') {
		errors.push('File Reader');
	}
	if (typeof document.documentElement.requestFullscreen === 'undefined' &&
		typeof document.documentElement.msRequestFullscreen === 'undefined' &&
		typeof document.documentElement.mozRequestFullScreen === 'undefined' &&
		typeof document.documentElement.webkitRequestFullscreen === 'undefined') {
		errors.push('Request Full Screen');
	}

	function hasErrors(errors) {
		if (errors.length > 0) {
			let message = '<div class="errors">';
			message += '<h1>Your browser is missing features required to run this program:</h1>';
			for (let i=0; i<errors.length; ++i) {
				message += (errors[i] + ' is not supported!<br/>');
			}
			message += '</div>';
			//document.body.innerHTML = message;
			return true;
		}

		return false;
	}

	if (! hasErrors(errors)) {
		// Test the Web Workers requirements
		let worker = new Worker('./lib/ws/test_requirements_worker.js');
		worker.onmessage = function(e) {
			if (e.data.action === 'test_requirements') {
				let errors = e.data.errors;
				if (! hasErrors(errors)) {
					// Test Web Workers for transferable objects
					let array_buffer = new ArrayBuffer(1);
					let message = {
						action: 'test_transferable_objects',
						array_buffer: array_buffer
					};
					worker.postMessage(message, [array_buffer]);
					if (array_buffer.byteLength !== 0) {
						errors = ['Transferable Object'];
						hasErrors(errors);
					}
				}
			}
		};

		let message = {
			action: 'test_requirements'
		};
		worker.postMessage(message);
	}

	cb();
}

/*
const test = () => requireBrowserFeatures(function() {
    // Start the service worker
    if (g_use_service_worker && 'serviceWorker' in navigator) {
        navigator.serviceWorker.register('./lib/ws/service_worker.js', { scope: '/' }).then(function(reg) {
            if (reg.installing) {
                console.log('Service worker installing');
            } else if (reg.waiting) {
                console.log('Service worker installed');
            } else if (reg.active) {
                console.log('Service worker active');
            }
            //main()
        }).catch(function(error) {
            console.error('Failed to register service worker: ');
            console.error(error);
        });
    } else {
        console.info('Service workers are not supported ...');
        PDFJS.disableWorker = true;
        //main();
    }
});
*/
