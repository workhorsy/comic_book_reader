// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under a MIT License
// https://github.com/workhorsy/uncompress.js
'use strict'

importScripts('./lib/js/uncompress.js')

// Regex to detect image type
const regexImage = new RegExp('^.+.(jpeg|jpg|png|bpm|webp|gif)$')

// Check if file is a valid image-type
const isValidImageType = name => regexImage.test(name)

// Extract file MIME Type
const getFileMimeType = name => {
  const mime = regexImage.exec(name)
  return `image/${mime ? mime[1] : 'jpeg'}`
}

const handleEntry = (entry, index, totalEntries) => {
  entry.readData((data, error) => {
    // Hanlde error
    if (error) {
      // Sen error to main thead
      self.postMessage({ action: 'error-data', error })
      return false
    }
    // Ignore folders
    if (entry.is_file && data) {
      const size = data.byteLength
      const name = entry.name
      const blob = new Blob([data], { type: getFileMimeType(entry.name) })
      const url = URL.createObjectURL(blob)
      // Create message
      const message = {
        action: 'uncompress_each',
        payload: {
          archive: { totalEntries },
          file: { index, url, name, size },
        },
      }
      // Send entry to main thread
      self.postMessage(message)
    }
  })
}

const handleUncompress = archive => {
  // Get only the entries that are images
  let entries = archive.entries.filter(entry => isValidImageType(entry.name))
  // Uncompress each entry and send it to the client
  for (let index = 0, count = entries.length; index < count; index++) {
    handleEntry(entries[index], index, count)
  }
}

const tasks = {
  uncompress_start: data => {
    try {
      // Open the array buffer as an archive
      const { file_name, password, array_buffer } = data
      const archive = self.archiveOpenArrayBuffer(
        file_name,
        password,
        array_buffer
      )
      archive && handleUncompress(archive)
    } catch (e) {
      // Handle error
      let message = { action: 'error', error: e.message }
      self.postMessage(message)
    }
  },
}

const handleTask = event => {
  const { action, payload } = event.data
  tasks[action] && tasks[action](payload)
}

// Load all the archive formats
self.loadArchiveFormats(['rar', 'zip', 'tar'], function() {
  self.addEventListener('message', handleTask, false)
  self.postMessage({ action: 'ready' })
  console.info('Worker ready ...')
})
