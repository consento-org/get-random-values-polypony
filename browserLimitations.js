module.exports = function (getRandomValues) {
  const name = getRandomValues.name + 'Limited'
  const impl = function (input) {
    let wrongType
    if (input instanceof Float32Array) {
      wrongType = 'Float32'
    }
    if (input instanceof Float64Array) {
      wrongType = 'Float64'
    }
    if (input instanceof DataView) {
      wrongType = 'DataView'
    }
    if (wrongType !== undefined) {
      throw new Error('Failed to execute \'getRandomValues\' on \'Crypto\': The provided ArrayBufferView is of type \'' + wrongType + '\', which is not an integer array type.')
    }
    if ('byteLength' in input && input.byteLength > 65536) {
      throw new Error('Failed to execute \'getRandomValues\' on \'Crypto\': The ArrayBufferView\'s byte length (' + input.byteLength + ') exceeds the number of bytes of entropy available via this API (65536).')
    }
    return getRandomValues(input)
  }
  Object.defineProperty(impl, 'name', { value: name, writable: false })
  return impl
}
