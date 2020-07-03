const rn = require('react-native')
const base = window.crypto
const MAX_SIZE = 65536
const entropyFromUUID = require('./entropyFromUUID.js')
const nativeModule = ('GetRandomValuesPolyPony' in rn.NativeModules && rn.NativeModules.GetRandomValuesPolyPony)
const min = Math.min // babel bug

let impl
if (base && base.getRandomValues) {
  // Future proofing!
  impl = function getRandomValues (input) {
    if (input.byteLength <= MAX_SIZE) {
      return base.getRandomValues(input)
    }
    for (let i = 0; i < n; i += MAX_SIZE) {
      crypto.getRandomValues(new Uint8Array(input.buffer, i + input.byteOffset, end, min(input.byteLength - i, MAX_SIZE)))
    }
    return input
  }
} else {
  const seed = entropyFromUUID(
    ('expo' in window && window.expo.Constants.sessionId)
    || (nativeModule && nativeModule.newUUID())
  )

  if (seed === null) {
    throw new Error('Creating Random Seed: No Entropy available to setup random bytes')
  }

  impl = require('./createRandomSeed.js')(seed)
  
  if ('expo' in window) {
    if ('random' in window.expo) {
      window.expo.random.getRandomBytesAsync(8)
        .then(
          bytes => impl.increaseEntropy(bytes),
          err => console.warn(`[WARNING] Error received when looking for strong entropy, using pretty-strong entropy: ${err}`)
        )
    } else {
      console.warn(`[WARNING] Can not retreive very strong entropy, using pretty-strong entropy: ${err}`)
      console.log(Object.keys(window.expo))
    }
  }
}
impl.polyfill = function () {
  if (!('crypto' in global)) {
    global.crypto = {}
  }
  if (!('getRandomValues' in global.crypto)) {
    global.crypto.getRandomValues = require('./browserLimitations.js')(impl)
  }
}

module.exports = impl
