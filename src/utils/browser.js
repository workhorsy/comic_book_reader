//https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
export function toggleFullScreen() {
  if (
    !document.fullscreenElement &&
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement &&
    !document.msFullscreenElement
  ) {
    console.info('Calling full screen ................')
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen()
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen()
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    }
  } else {
    console.info('Calling exit full screen ................')
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }
}

// Show an error message if any required browser features are missing
export function requireBrowserFeatures(cb) {
  let errors = []
  if (!('transform' in document.body.style)) {
    errors.push('CSS transform')
  }
  if (typeof Blob === 'undefined') {
    errors.push('Blob')
  }
  if (typeof Object === 'undefined' || typeof Object.defineProperty === 'undefined') {
    errors.push('Object defineProperty')
  }
  if (typeof Object === 'undefined' || typeof Object.hasOwnProperty === 'undefined') {
    errors.push('Object hasOwnProperty')
  }
  if (
    typeof window.HTMLCanvasElement === 'undefined' ||
    typeof window.HTMLCanvasElement.prototype.getContext === 'undefined'
  ) {
    errors.push('Canvas Context')
  }
  if (typeof Uint8Array === 'undefined') {
    errors.push('Uint8Array')
  }
  if (typeof indexedDB === 'undefined') {
    errors.push('Indexed DB')
  }
  if (typeof localStorage === 'undefined') {
    errors.push('Local Storage')
  }
  if (typeof Worker === 'undefined') {
    errors.push('Web Worker')
  }
  if (typeof URL === 'undefined' || typeof URL.createObjectURL === 'undefined') {
    errors.push('Create Object URL')
  }
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL === 'undefined') {
    errors.push('Revoke Object URL')
  }
  if (typeof JSON === 'undefined' || typeof JSON.stringify === 'undefined') {
    errors.push('JSON Stringify')
  }
  if (typeof JSON === 'undefined' || typeof JSON.parse === 'undefined') {
    errors.push('JSON Parse')
  }
  if (typeof FileReader === 'undefined') {
    errors.push('File Reader')
  }
  if (
    typeof document.documentElement.requestFullscreen === 'undefined' &&
    typeof document.documentElement.msRequestFullscreen === 'undefined' &&
    typeof document.documentElement.mozRequestFullScreen === 'undefined' &&
    typeof document.documentElement.webkitRequestFullscreen === 'undefined'
  ) {
    errors.push('Request Full Screen')
  }

  cb(errors)
}
