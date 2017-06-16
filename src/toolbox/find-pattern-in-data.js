import { dataTypeOf } from './data-type-of'

/*

 returns an array of objects
 object.value == value which matched the regex pattern
 object.key == absolute key for the value

  Example for pattern '/solutions/' using a player object:
  {
    value: 'https://solutions.theplatform.com/jamin.demattos/customers/nbcu/nbcsports/player/tp-player-packager/src/player/sites/nbcsports/controlRack/nbcsgRack.xml',
    key: 'data.customProperties.layoutUrl'
  }

 */
function findPatternInData(data, pattern, key, logging = false, results = []) {

  if(dataTypeOf(data) === 'string') {
    if(pattern.test(data)) {
      if(logging) log(data, key)
      results.push({ value: data, key: key })
    }
  }

  if(dataTypeOf(data) === 'number') {
    data = data.toString()
    if(pattern.test(data)) {
      if(logging) log(+data, key)
      results.push({ value: +data, key: key })
    }
  }

  if(dataTypeOf(data) === 'array') {
    data.forEach((value, index) => {
      let trail = `${key}[${index}]`
      findPatternInData(value, pattern, trail, logging, results)
    })
  }

  if(dataTypeOf(data) === 'object') {
    for(let property in data) {
      let value = data[property]
      let trail = `${key}.${property}`
      findPatternInData(value, pattern, trail, logging, results)
    }
  }

  function log(data, key) {
    console.log(`pattern matched`)
    console.log(`value: ${data}`)
    if(key) console.log(`key: ${key}`)
    console.log()
  }

  return results
}



let data1 = {
  one: 'easteregg1',
  two: ['asdf', 123, {thirteen: 'asdf'}, ['easteregg2']],
  six: [],
  three: {},
  five: {
    seven: {
      eight: {
        nine: 'asdf',
        ten: 'easteregg3',
        eleven: 123,
        twelve: []
      }
    }
  },
  four: 123,
  fourteen: null,
  fifteen: undefined,
  sixteen: function() {

  },
  seventeen: Symbol()
}

let data2 = {
  one: 'easteregg4',
  two: 'easteregg',
  three: 'easteregg1',
  four: {
    five: 'asdf',
    six: 'asdf',
    seven: 'easteregg2',
    eight: {
      nine: 'asdf',
      ten: 'asdf',
      eleven: 'easteregg3',
      twelve: 123,
      thirteen: 789
    }
  }
}

// fs.readFile('./testdata/current-embed-player.json', 'utf8', (err, value) => {
//   if(err) throw err

//   // console.log(JSON.parse(data))
//   let data = JSON.parse(value)

//   let results = findPatternInData(data, /solutions/, 'data', true)
//   console.log(results)

// })




// dataTypeOf_test_1(data)
// let results = findPatternInData(data1, /easteregg1/g, 'data1', true)
// let results = findPatternInData(data1, /123/, 'data1', true)
// let results = findPatternInData(data1, /easteregg\d?/, 'data1', true)
// let results = findPatternInData(data2, /easteregg\d?/, 'data2', true)
// let results = findPatternInData(data2, /789/, 'data2', true)

// console.log(results)






function dataTypeOf_test_1(data) {
  for(let prop in data) {
    let value = data[prop]
    console.log(value)
    console.log(typeof(value))
    console.log(dataTypeOf(value))
    console.log()
  }
}





export { findPatternInData }
