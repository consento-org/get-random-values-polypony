const MurmurHash3 = require('./murmurhash3.js')
const { not, xor, shiftLeft, shiftRightUnsigned, add } = require('./long.js')

function writeUint8 (array, offset, long) {
  array[offset++] = long.low & 0xff
  array[offset++] = (long.low & 0xff00) >> 8
  array[offset++] = (long.low & 0xff0000) >> 16
  array[offset++] = (long.low & 0xff000000) >> 24
  array[offset++] = long.high & 0xff
  array[offset++] = (long.high & 0xff00) >> 8
  array[offset++] = (long.high & 0xff0000) >> 16
  array[offset++] = (long.high & 0xff000000) >> 24
  return offset
}

function writeUint16 (array, offset, long) {
  array[offset++] = long.low & 0xffff
  array[offset++] = (long.low & 0xffff0000) >> 16
  array[offset++] = long.high & 0xffff
  array[offset++] = (long.high & 0xffff0000) >> 16
  return offset
}

function writeInt8 (array, offset, long) {
  array[offset++] = (long.low & 0xff) - 0x80
  array[offset++] = ((long.low & 0xff00) >> 8) - 0x80
  array[offset++] = ((long.low & 0xff0000) >> 16) - 0x80
  array[offset++] = ((long.low & 0xff000000) >> 24) - 0x80
  array[offset++] = (long.high & 0xff) - 0x80
  array[offset++] = ((long.high & 0xff00) >> 8) - 0x80
  array[offset++] = ((long.high & 0xff0000) >> 16) - 0x80
  array[offset++] = ((long.high & 0xff000000) >> 24) - 0x80
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
  if (input instanceof Uint8ClampedArray) {
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
  throw new Error('invalid input')
}

module.exports = function createRandomSeed (seedlong) {
  const Temp = { low: 0|0, high: 0|0 }

  // Ported from: https://github.com/v8/v8/blob/a3b02dc76d8e8f4e4ee3848fe1e6c009952fc24b/src/base/utils/random-number-generator.cc#L214
  let state0 = { low: 0|0, high: 0|0 }
  MurmurHash3(seedlong, state0)
  let state1 = { low: 0|0, high: 0|0 }
  not(state0, state1)
  MurmurHash3(state1, state1)

  return function getRandomValuesSeed (input) {
    const len = input.length
    const write = getWrite(input)
    
    for (let offset = 0; offset < len;) {
      // XorShift128 Ported from: https://github.com/v8/v8/blob/a3b02dc76d8e8f4e4ee3848fe1e6c009952fc24b/src/base/utils/random-number-generator.h#L119-L128
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
}
