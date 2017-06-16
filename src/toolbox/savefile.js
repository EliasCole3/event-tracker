
function savefile(data, filename) {
  if (typeof(data) === 'object') {
    data = JSON.stringify(data)
  }
  let textFileAsBlob = new Blob([data], { type: 'text/plain' })

  let downloadLink = document.createElement('a')
  downloadLink.download = filename
  downloadLink.innerHTML = 'Download File'
  if (window.URL != null) {
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
  }
  else {
    downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
    downloadLink.onclick = destroyClickedElement
    downloadLink.style.display = 'none'
    document.body.appendChild(downloadLink)
  }

  downloadLink.click()
}

function destroyClickedElement(event) {
  document.body.removeChild(event.target)
}

export { savefile }