const base = window.crypto || window.msCrypto
const MAX_SIZE = 65536
function getRandomValuesBrowser (input) {
  const n = input.byteLength
  const offset = input.byteOffset
  const buffer = input.buffer
  if (n <= MAX_SIZE) {
    base.getRandomValues(
      (input instanceof Float32Array || input instanceof Float64Array || input instanceof DataView || ((window.msCrypto || !!window.StyleMedia) && input instanceof Uint8ClampedArray))
        ? new Uint8Array(buffer, offset, n)
        : base.getRandomValues(input)
    )
  } else {
    for (let i = 0; i < n; i += MAX_SIZE) {
      base.crypto.getRandomValues(new Uint8Array(buffer, i + offset, Math.min(n - i, MAX_SIZE)))
    }
  }
  return input
}
getRandomValuesBrowser.name = 'getRandomValuesBrowser' // IE 11
getRandomValuesBrowser.polyfill = function () {
  if (window.crypto === undefined) {
    // Internet explorer 11 should get the getRandomValues method
    // as well, if polyfill is required.
    window.crypto = {
      getRandomValues: function (input) {
        return base.getRandomValues(input)
      }
    }
  }
}

module.exports = getRandomValuesBrowser
