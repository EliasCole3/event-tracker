

function loadfile(callback) {
  if(!document.getElementById('input-for-load')) {
    let node = document.createElement('input')
    node.id = 'input-for-load'
    node.type = 'file'
    node.style.display = 'none'
    document.body.appendChild(node)
  }

  document.getElementById('input-for-load').addEventListener('change', e => {
    doTheThing(e, callback)
  })

  document.getElementById('input-for-load').click()
}

function doTheThing(e, callback) {
  let reader = new FileReader()
  reader.readAsText(e.currentTarget.files[0])
  reader.onload = event => {
    callback(event.target.result)
  }
}

// function waitForElement(element, loopTime, loopNumber, callback) {

//   console.log(loopNumber)

//   if(loopNumber <= 0) {
//     console.log('unable to find element: ' + element)
//     return
//   }

//   if(document.getElementById(element) != null) {
//     callback()
//   } else {
//     loopNumber--
//     setTimeout(function() {
//       waitForElement(element, loopTime, loopNumber, callback)
//     }, loopTime)
//   }

// }

export { loadfile }

