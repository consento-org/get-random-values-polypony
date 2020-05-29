const murmurhash3 = require('./murmurhash3.js')
const murmurhash3String = murmurhash3.murmurhash3String
const murmurhash3Long = murmurhash3.murmurhash3Long
const lng = require('./long.js')
const not = lng.not
const xor = lng.xor
const shiftLeft = lng.shiftLeft
const shiftRightUnsigned = lng.shiftRightUnsigned
const isZero = lng.isZero
const copy = lng.copy
const add = lng.add
const fromFloat = lng.fromFloat
const Temp = { low: 0|0, high: 0|0 }

function writeUint8 (array, offset, long) {
  const low = long.low
  const high = long.high
  array[offset++] = low & 0xff
  array[offset++] = (low & 0xff00) >> 8
  array[offset++] = (low & 0xff0000) >> 16
  array[offset++] = (low & 0xff000000) >> 24
  array[offset++] = high & 0xff
  array[offset++] = (high & 0xff00) >> 8
  array[offset++] = (high & 0xff0000) >> 16
  array[offset++] = (high & 0xff000000) >> 24
  return offset
}

function writeUint16 (array, offset, long) {
  const low = long.low
  const high = long.high
  array[offset++] = low & 0xffff
  array[offset++] = (low & 0xffff0000) >> 16
  array[offset++] = high & 0xffff
  array[offset++] = (high & 0xffff0000) >> 16
  return offset
}

function writeInt8 (array, offset, long) {
  const low = long.low
  const high = long.high
  array[offset++] = (low & 0xff) - 0x80
  array[offset++] = ((low & 0xff00) >> 8) - 0x80
  array[offset++] = ((low & 0xff0000) >> 16) - 0x80
  array[offset++] = ((low & 0xff000000) >> 24) - 0x80
  array[offset++] = (high & 0xff) - 0x80
  array[offset++] = ((high & 0xff00) >> 8) - 0x80
  array[offset++] = ((high & 0xff0000) >> 16) - 0x80
  array[offset++] = ((high & 0xff000000) >> 24) - 0x80
  return offset
}

function writeInt16 (array, offset, long) {
  array[offset++] = (long.low & 0xffff) - 0x8000
  array[offset++] = ((long.low & 0xffff0000) >> 16) - 0x8000
  array[offset++] = (long.high & 0xffff) - 0x8000
  array[offset++] = ((long.high & 0xffff0000) >> 16) - 0x8000
  return offset
}

function writeUint32 (array, offset, long) {
  array[offset++] = long.low
  array[offset++] = long.high
  return offset
}

function writeInt32 (array, offset, long) {
  array[offset++] = long.low - 0x80000000
  array[offset++] = long.high - 0x80000000
  return offset
}

function getWrite (input) {
  if (input instanceof Uint8Array) {
    return writeUint8
  }
  if (input instanceof Uint16Array) {
    return writeUint16
  }
  if (input instanceof Uint32Array) {
    return writeUint32
  }
  if (input instanceof Int8Array) {
    return writeInt8
  }
  if (input instanceof Int16Array) {
    return writeInt16
  }
  if (input instanceof Int32Array) {
    return writeInt32
  }
  if (input && input.buffer instanceof ArrayBuffer) {
    // Note: This will also take care of Uint8ClampedArray -> which is buggy on browsers?!
    const uint8 = new Uint8Array(input.buffer)
    return function (_, offset, long) {
      return writeUint8(uint8, offset, long)
    }
  }
  throw Object.assign(new TypeError('[ERR_INVALID_ARG_TYPE]: The "buf" argument must be an instance of ArrayBufferView. Received type ' + (typeof input) + ' (' + input + ')'), { code: 'ERR_INVALID_ARG_TYPE' })
}

function createRandomSeed (seedInput) {
  // Ported from: https://github.com/v8/v8/blob/a3b02dc76d8e8f4e4ee3848fe1e6c009952fc24b/src/base/utils/random-number-generator.cc#L214
  let state0 = { low: 0|0, high: 0|0 }
  increaseEntropy(seedInput)
  if (isZero(state0)) {
    throw new Error('Given entropy is not usable for random generation [state0=0]')
  }
  let state1 = { low: 0|0, high: 0|0 }
  murmurhash3Long(not(state0, state1), state1)
  if (isZero(state1)) {
    throw new Error('Given entropy is not usable for random generation [state1=0]')
  }

  const random = function getRandomValuesSeed (input) {
    const len = input.byteLength
    const write = getWrite(input)
    
    for (let offset = 0; offset < len;) {
      // XorShift128: Ported from: https://github.com/v8/v8/blob/a3b02dc76d8e8f4e4ee3848fe1e6c009952fc24b/src/base/utils/random-number-generator.h#L119-L128
      xor(state0, shiftLeft(state0, 23, Temp), state0)
      xor(state0, shiftRightUnsigned(state0, 17, Temp), state0)
      xor(state0, state1, state0)
      xor(state0, shiftRightUnsigned(state1, 26, Temp), state0)
      const tmp = state0
      state0 = state1
      state1 = tmp
      // Ported from: https://github.com/v8/v8/blob/a3b02dc76d8e8f4e4ee3848fe1e6c009952fc24b/src/base/utils/random-number-generator.cc#L210
      offset = write(input, offset, add(state0, state1, Temp))
    }
    return input
  }
  random.increaseEntropy = increaseEntropy
  return random

  function increaseEntropy (input) {
    if (input === null || input === undefined) {
      return false
    }
    if (Array.isArray(input)) {
      return input.reduce(function (hasIncreased, entry) {
        return increaseEntropy(entry) || hasIncreased
      }, false)
    }
    if (typeof input === 'string') {
      murmurhash3String(input, Temp)
    } else if (typeof input === 'object') {
      if (typeof input.low === 'number' && typeof input.high === 'number') {
        copy(input, Temp)
      } else {
        console.log('[Warning] Unusable random seed input type: ' + input)
        return false
      }
    } else {
      if (isNaN(input) || !isFinite(input)) {
        console.log('[Warning] Unusable random seed input type: ' + input)
        return false
      }
      fromFloat(input, Temp, false)
    }
    xor(state0, murmurhash3Long(Temp, Temp), Temp)
    if (isZero(Temp)) {
      console.log('[Warning] Unusuable random seed input, it would result in a zero entropy.')
      return false
    }
    copy(Temp, state0)
    return true
  }
}
createRandomSeed.name = 'createRandomSeed' // IE 11
module.exports = createRandomSeed
