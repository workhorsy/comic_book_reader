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
      console.log(res.headers.get('Content-Type'))
      return res.arrayBuffer()
    })
    .then(buffer => callback(buffer))
    .catch(error => {
      console.log('Request failed', error)
    })
}

export default fetchArchive
