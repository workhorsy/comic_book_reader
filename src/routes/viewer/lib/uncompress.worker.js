// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under a MIT License
// https://github.com/workhorsy/uncompress.js
'use strict'

importScripts('./assets/js/uncompress.js')

// Regex to detect image type
const regexImage = new RegExp('^.+.(jpeg|jpg|png|bpm|webp|gif)$')

// Check if file is a valid image-type
const isValidImageType = name => regexImage.test(name)

// Extract file MIME Type
const getFileMimeType = name => {
  const mime = regexImage.exec(name)
  return `image/${mime ? mime[1] : 'jpeg'}`
}

const handleEntry = (index, entry, archive) => {
  entry.readData((data, error) => {
    // Hanlde error
    if (error) {
      // Sen error to main thead
      self.postMessage({ action: 'error', payload: { error } })
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
          file: { index, url, name, size },
        },
      }
      // Uncompress cover
      if (index === 0) {
        message.action = 'uncompress_cover'
        message.payload.archive = archive
      }
      // Send entry to main thread
      self.postMessage(message)
    }
  })
}

const handleUncompress = archive => {
  // Get only the entries that are images
  const { file_name: name, entries } = archive
  const pages = entries.filter(entry => isValidImageType(entry.name))
  // Uncompress each entry and send it to the client
  for (let index = 0, totalPages = pages.length; index < totalPages; index++) {
    handleEntry(index, pages[index], { name, totalPages })
  }
}

const tasks = {
  uncompress_buffer_start: data => {
    try {
      // Open the array buffer as an archive
      const { file_name, password, array_buffer } = data
      const archive = self.archiveOpenArrayBuffer(
        file_name,
        password,
        array_buffer
      )
      archive && handleUncompress(archive)
    } catch (error) {
      // Handle error
      let message = {
        action: 'error',
        payload: { error: error.message },
      }
      self.postMessage(message)
    }
  },
  uncompress_file_start: data => {
    try {
      // Open the file as an archive
      const { file, password } = data
      self.archiveOpenFile(file, password, (archive, error) => {
        if (error) {
          let message = {
            action: 'error',
            payload: { error: error },
          }
          self.postMessage(message)
          return false
        }
        archive && handleUncompress(archive)
      })
    } catch (error) {
      // Handle error
      let message = {
        action: 'error',
        payload: { error: error.message },
      }
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
