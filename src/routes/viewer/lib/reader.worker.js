// Copyright (c) 2017 Matthew Brennan Jones <matthew.brennan.jones@gmail.com>
// This software is licensed under a MIT License
// https://github.com/workhorsy/uncompress.js
'use strict'

importScripts('./lib/js/uncompress.js')

// Load all the archive formats
loadArchiveFormats(['rar', 'zip', 'tar'], function() {
  console.info('Worker ready ...')
})

// Regex to detect image type
const regexImage = new RegExp('^.+.(jpeg|jpg|png|bpm|webp|gif)$')
const isValidImageType = name => regexImage.test(name)

// Regex to detect metadata
const regexMeta = new RegExp('^.+.(acbf|xml|json)$')
const isValidMetadata = name => regexMeta.test(name)

// Extract file MIME Type
const getFileMimeType = name => {
  const mime = regxImage.exec(name)
  return `image/${mime ? mime[1] : 'jpeg'}`
}

const hanleEntry = (entry, index, totalEntries) => {
  entry.readData((data, error) => {
    // Hanlde error
    if (error) {
      // Sen error to main thead
      self.postMessage({ action: 'error', error })
      return
    }

    // Ignore folders
    if (entry.is_file && data) {
      let size = data.byteLength
      let name = entry.name
      let blob = new Blob([data], { type: getFileMimeType(entry.name) })
      let url = URL.createObjectURL(blob)

      // Create message
      let message = {
        action: 'uncompress:each',
        archive: { totalEntries },
        file: { url, name, size, index },
      }

      // Send entry to main thread
      self.postMessage(message)
    }
  })
}

const handleUncompress = archive => {
  // Debug archive
  console.info('Uncompressing:', archive)
  // Get only the entries that are images
  let entries = archive.entries.filter(entry => isValidImageType(entry.name))
  // Uncompress each entry and send it to the client
  for (let index = 0, count = entries.length; index < count; index++) {
    handleEntry(entries[index], index, count)
  }
}

const tasks = {
  'uncompress:start': data => {
    let { file_name, password, array_buffer } = data
    console.log(data)
    try {
      // Open the array buffer as an archive
      let archive = archiveOpenArrayBuffer(file_name, password, array_buffer)
      //archive && handleUncompress(archive)
    } catch (e) {
      // Handle error
      let message = { action: 'error', error: e.message }
      self.postMessage(message)
    }
  },
}

const handleTask = event => {
  const { action, data } = event.data
  tasks[action] && tasks[action](data)
}

self.addEventListener('message', handleTask, false)
