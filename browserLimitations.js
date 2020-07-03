const BigInt64Array = global.BigInt64Array || class {}
const BigUint64Array = global.BigUint64Array || class {}

module.exports = function (getRandomValues) {
  const name = getRandomValues.name + 'Limited'
  const impl = function (input) {
    // Quick checking for most common case
    if (!(input instanceof Uint8Array)) {
      let wrongType
      if (input instanceof Float32Array) {
        wrongType = 'Float32'
      } else if (input instanceof Float64Array) {
        wrongType = 'Float64'
      } else if (input instanceof DataView) {
        wrongType = 'DataView'
      } else if (input instanceof BigInt64Array) {
        wrongType = 'BigInt64'
      } else if (input instanceof BigUint64Array) {
        wrongType = 'BigUint64'
      }
      if (wrongType !== undefined) {
        throw new Error('Failed to execute \'getRandomValues\' on \'Crypto\': The provided ArrayBufferView is of type \'' + wrongType + '\', which is not an integer array type.')
      }
    }
    if ('byteLength' in input && input.byteLength > 65536) {
      throw new Error('Failed to execute \'getRandomValues\' on \'Crypto\': The ArrayBufferView\'s byte length (' + input.byteLength + ') exceeds the number of bytes of entropy available via this API (65536).')
    }
    return getRandomValues(input)
  }
  Object.defineProperty(impl, 'name', { value: name, writable: false })
  return impl
}
