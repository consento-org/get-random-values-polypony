const MAX_SIZE = 65536
let base
let getRandomValues
let polyfill
if (window.msCrypto || !!window.StyleMedia) { // IE or Metro
  base = window.msCrypto || window.crypto
  const randomValues = base.getRandomValues
  getRandomValues = function (input) {
    if (input instanceof Uint8ClampedArray) {
      randomValues.call(base, new Uint8Array(input.buffer, input.byteOffset, input.byteLength))
    } else {
      randomValues.call(base, input)
    }
    return input
  }
  polyfill = function () {
    if (!window.crypto) {
      window.crypto = {}
    }
    if (window.crypto.getRandomValues !== getRandomValues) {
      window.crypto._getRandomValues = window.crypto.getRandomValues
      window.crypto.getRandomValues = getRandomValues
    }
  }
} else {
  base = window.crypto
  polyfill = function () {}
  getRandomValues = base.getRandomValues
}
function getRandomValuesBrowser (input) {
  const n = input.byteLength
  const offset = input.byteOffset
  const buffer = input.buffer
  if (n <= MAX_SIZE) {
    getRandomValues.call(
      base,
      (
        input instanceof Float32Array ||
        input instanceof Float64Array ||
        input instanceof DataView ||
        (
          window.BigInt64Array &&
          (
            input instanceof window.BigInt64Array ||
            input instanceof window.BigUint64Array
          )
        )
      )
        ? new Uint8Array(buffer, offset, n)
        : input
    )
  } else {
    for (let i = 0; i < n; i += MAX_SIZE) {
      getRandomValues.call(base, new Uint8Array(buffer, i + offset, Math.min(n - i, MAX_SIZE)))
    }
  }

  return input
}
getRandomValuesBrowser.name = 'getRandomValuesBrowser' // IE 11
getRandomValuesBrowser.polyfill = polyfill

module.exports = getRandomValuesBrowser
