function arraymove(array, fromIndex, toIndex) {
  // boundaries. Should probably throw an error, but this is fine for now
  if(fromIndex < 0) fromIndex = 0
  if(toIndex < 0) toIndex = 0
  if(fromIndex > array.length-1) fromIndex = array.length-1
  if(toIndex > array.length-1) toIndex = array.length-1

  let newArray = JSON.parse(JSON.stringify(array))
  let element = newArray[fromIndex]
  newArray.splice(fromIndex, 1)
  newArray.splice(toIndex, 0, element)
  return newArray
}

export { arraymove }