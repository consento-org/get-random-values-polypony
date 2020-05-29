const base = window.crypto || window.msCrypto
const MAX_SIZE = 65536
function getRandomValuesBrowser (input) {
  if (input.byteLength <= MAX_SIZE) {
    base.getRandomValues(
      (input instanceof Float32Array || input instanceof Float64Array || input instanceof DataView || window.msCrypto && input instanceof Uint8ClampedArray)
      ? new Uint8Array(input.buffer)
      : base.getRandomValues(input)
    )
  } else {
    const temp = new Uint8Array(MAX_SIZE)
    const buffer = input.buffer
    const inputUint8 = input instanceof Uint8Array ? input : new Uint8Array(buffer)
    for (let i = 0; i < inputUint8.byteLength; i += MAX_SIZE) {
      for (let j = 0; j < MAX_SIZE; j++) {
        inputUint8[i + j] = temp[j]
      }
    }
  }
  return input
}
getRandomValuesBrowser.name = 'getRandomValuesBrowser' // IE 11
getRandomValuesBrowser.lowEntropy = false
getRandomValuesBrowser.highEntropyPromise = Promise.resolve()
getRandomValuesBrowser.polyfill = function () { return Promise.resolve() }

module.exports = getRandomValuesBrowser
