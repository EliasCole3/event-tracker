// because javascript is wonky
function dataTypeOf(value) {
  if(typeof (value) === 'string') return 'string'
  if(typeof (value) === 'number') return 'number'
  if(typeof (value) === 'symbol') return 'symbol'
  if(typeof (value) === 'boolean') return 'boolean'
  if(typeof (value) === 'undefined') return 'undefined'
  if(typeof (value) === 'function') return 'function'
  if(value === null) return 'null'
  if(typeof (value) === 'object') {
    if(Array.isArray(value)) return 'array'
    return 'object'
  }
}

export { dataTypeOf }