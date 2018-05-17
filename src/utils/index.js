export function generateId() {
  // Get a 18 character user id
  const code_table = '0123456789'
  let user_id = ''
  for (let i = 0; i < 18; ++i) {
    // Get a random number between 0 and 10
    const num = Math.floor(Math.random() * code_table.length)

    // Get the character that corresponds to the number
    user_id += code_table[num]
  }

  return user_id
}

// helper function to load image using promises
export function loadImage(src) {
  new Promise(function(resolve, reject) {
    var img = document.createElement('img')
    img.addEventListener('load', function() {
      resolve(img)
    })
    img.addEventListener('error', function(err) {
      reject(404)
    })
    img.src = src
  })
}
