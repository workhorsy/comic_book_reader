function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

const fetchArchive = (url, callback) => {
  fetch(url, { mode: 'cors' })
    .then(status)
    .then(res => {
      // Get content-type
      const contentType = res.headers.get('Content-Type')
      return res.arrayBuffer()
    })
    .then(buffer => callback(buffer))
    .catch(error => {
      console.error('Request failed', error)
    })
}

export default fetchArchive
