const { multiply, xor, shiftRight, copy } = require('./long.js')

// Ported from https://github.com/v8/v8/blob/a3b02dc76d8e8f4e4ee3848fe1e6c009952fc24b/src/base/utils/random-number-generator.cc#L222-L229
const Multiply1 = { low: 0xFF51AFD7|0, high: 0xED558CCD|0 }
const Multiply2 = { low: 0xC4CEB9FE|0, high: 0x1A85EC53|0 }
const Temp = { low: 0|0, high: 0|0 }
module.exports = function murmurhash3 (h, target) {
  if (h !== target) {
    copy(h, target)
  }
  shiftRight(target, 33, Temp)
  xor(target, Temp, target)
  multiply(target, Multiply1, target, true)
  shiftRight(target, 33, Temp)
  xor(target, Temp, target)
  multiply(target, Multiply2, target, true)
  shiftRight(target, 33, Temp)
  xor(target, Temp, target)
  return target
}
