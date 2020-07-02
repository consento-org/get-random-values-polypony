const rn = require('react-native')
const base = window.crypto
const MAX_SIZE = 65536
const entropyFromUUID = require('./entropyFromUUID.js')
const nativeModule = ('GetRandomValuesPolyPony' in rn.NativeModules && rn.NativeModules.GetRandomValuesPolyPony)
console.log({ nativeModule })

function readInt32LE (buffer, offset) {
  const first = buffer[offset];
  const last = buffer[offset + 3];
  if (first === undefined || last === undefined)
    boundsError(offset, buffer.length - 4);

  return first +
    buffer[++offset] * 2 ** 8 +
    buffer[++offset] * 2 ** 16 +
    (last << 24); // Overflow
}

let impl
if (base && base.getRandomValues) {
  // Future proofing!
  impl = function getRandomValues (input) {
    if (input.byteLength <= MAX_SIZE) {
      return base.getRandomValues(input)
    }
    const temp = new Uint8Array(MAX_SIZE)
    const buffer = input.buffer
    const inputUint8 = input instanceof Uint8Array ? input : new Uint8Array(buffer)
    for (let i = 0; i < inputUint8.byteLength; i += MAX_SIZE) {
      for (let j = 0; j < MAX_SIZE; j++) {
        inputUint8[i + j] = temp[j]
      }
    }
    return input
  }
} else {
  const seed = entropyFromUUID(
    ('expo' in window && window.expo.Constants.sessionId)
    || (nativeModule && nativeModule.uuid)
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
  } else if (nativeModule) {
    nativeModule.newUUID(function (_, uuid) {
      impl.increaseEntropy(entropyFromUUID(uuid))
    })
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
