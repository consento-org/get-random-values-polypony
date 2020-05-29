const rn = require('react-native')
const base = window.crypto
const MAX_SIZE = 65536
let impl
if (base && base.getRandomValues) {
  // Future proofing!
  impl = function getRandomValues (input) {
    if (input.byteLength <= MAX_SIZE) {
      base.getRandomValues(base.getRandomValues(input))
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
  impl.lowEntropy = false
  impl.highEntropyPromise = Promise.resolve()
} else {
  while (true) {
    try {
      impl = require('./createRandomSeed.js')([
        'performance' in window ? window.performance.now() * 1000 /* will be rounded to 0 */ : +new Date,
        Math.random()
      ])
      break
    } catch (err) {
      // There is a very unlikely case when the seed data
      // happens to result in a [=0] random-seed based off
      // the Math.random() operation.
      // For a second attempt to fail is very-unlikely^2.
      console.log('Warning: ' + err)
    }
  }
  let entropyPromise
  if ('expo' in window) {
    impl.increaseEntropy(window.expo.Constants.sessionId)
    entropyPromise = require('expo-random').getRandomBytesAsync(8).then(uint8Array => Buffer.from(uint8Array.buffer))
  }
  if ('SyncRandomBytes' in rn.NativeModules) {
    const nativeSeed = rn.NativeModules.SyncRandomBytes.seed
    if (nativeSeed) {
      entropyPromise = Promise.resolve(Buffer.from(nativeSeed, 'base64'))
    } else {
      entropyPromise = rn.NativeModules.SyncRandomBytes.randomBytes(8).then(bytesStr => Buffer.from(bytesStr, 'base64'))
    }
  }
  impl.lowEntropy = true
  if (!entropyPromise) {
    entropyPromise = Promise.reject(new Error('No source for strong entropy found.'))
  }
  impl.highEntropyPromise = entropyPromise.then(bytes => {
    impl.increaseEntropy({ low: bytes.readInt32LE(0), high: bytes.readInt32LE(4) })
    impl.lowEntropy = false
  })
}
impl.polyfill = function () {
  return impl.highEntropyPromise.then(() => {
    if (!('crypto' in global)) {
      global.crypto = {}
    }
    if (!('getRandomValues' in global.crypto)) {
      global.crypto.randomValues = impl
    }
  })
}

module.exports = impl
