const regexImage = new RegExp('^.+.(jpeg|jpg|png|bpm|webp|gif)$')
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
      console.error({ action: 'error', error })
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
      console.log(message)
    }
  })
}

const handleUncompress = data => {
  // Debug archive
  console.info('Uncompressing:', archive)
  // Get only the entries that are images
  let entries = archive.entries.filter(entry => isValidImageType(entry.name))
  // Uncompress each entry and send it to the client
  for (let index = 0, count = entries.length; index < count; index++) {
    handleEntry(entries[index], index, count)
  }
}

const uncompressArchive = data => {
  // Load all the archive formats
  loadArchiveFormats(['rar', 'zip', 'tar'], e => {
    try {
      const { file_name, password, array_buffer } = data
      // Open the array buffer as an archive
      const archive = archiveOpenArrayBuffer(file_name, password, array_buffer)
      handleUncompress(archive)
    } catch (e) {
      // Handle error
      let message = { action: 'error', error: e.message }
      console.error(message)
    }
  })
}

export default uncompressArchive
