const crypto = require('crypto')

function randomFillUint8 (input, bytes) {
  const len = input.length
  for (let i = 0; i < len; i++) {
    input[i] = bytes[i]
  }
  return input
}

module.exports = function getRandomValuesNodeLt8 (input) {
  const bytes = crypto.randomBytes(input.byteLength)
  if (input instanceof Uint8Array) {
    return randomFillUint8(input, bytes)
  } else if (input && input.buffer instanceof ArrayBuffer) {
    const uint8Array = new Uint8Array(input.buffer)
    randomFillUint8(uint8Array, bytes)
    return input
  }
  throw Object.assign(new TypeError(`[ERR_INVALID_ARG_TYPE]: The "buf" argument must be an instance of ArrayBufferView. Received type ${typeof input} (${input})`), { code: 'ERR_INVALID_ARG_TYPE' })
}
