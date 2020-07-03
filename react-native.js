const base = window.crypto
const MAX_SIZE = 65536
let impl
if (base && base.getRandomValues) {
  const min = Math.min // babel bug
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
  const rn = require('react-native')
  const entropyFromUUID = require('./entropyFromUUID.js')
  const nativeModule = ('GetRandomValuesPolyPony' in rn.NativeModules && rn.NativeModules.GetRandomValuesPolyPony)
  const uniModules = rn.NativeModules.NativeUnimoduleProxy
  let seed
  if (nativeModule) {
    seed = nativeModule.newUUID()
  } else {
    const expoConstants = (uniModules && uniModules.modulesConstants && uniModules.modulesConstants.ExponentConstants)
    seed = expoConstants && expoConstants.sessionId
    if (typeof seed !== 'string') {
      throw new Error('Creating Random Seed: No Entropy available to setup random bytes')
    }
  }

  impl = require('./createRandomSeed.js')(entropyFromUUID(seed))
  
  if (!nativeModule) {
    // Collect more entropy since Expo.sessionId can be read from
    // other processes quite readily, while nativeModule.newUUID()
    // is harder to intercept.
    const uniMethods = uniModules && uniModules.exportedMethods
    const random = (
      uniMethods
      && uniMethods.ExpoRandom
      && uniMethods.ExpoRandom.find(method => method.name === 'getRandomBase64StringAsync')
      && function (...args) {
        return uniModules.callMethod('ExpoRandom', 'getRandomBase64StringAsync', args)
      }
    )

    if (random) {
      // 8 bytes are enough, but increaseEntropy assumes utf-8 encoded entropy, but
      // random returns base64 encoded entropy, which means we loose some entropy in the conversion.
      // To counteract ~x4 loss of entropy we collect 32 bit.
      random(32).then(
        bytes => impl.increaseEntropy(bytes),
        err => console.warn(`[WARNING] Error received when looking for strong entropy, using pretty-strong entropy: ${err}`)
      )
    } else {
      console.warn(`[WARNING] No means to retreive very strong entropy, using pretty-strong entropy.`)
    }
  }
}
impl.polyfill = function () {
  if (!('crypto' in window)) {
    window.crypto = {}
  }
  if (!('getRandomValues' in window.crypto)) {
    window.crypto.getRandomValues = require('./browserLimitations.js')(impl)
  }
}

module.exports = impl
