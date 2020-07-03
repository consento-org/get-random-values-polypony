const long = require('./long.js')
const multiply = long.multiply
const xor = long.xor
const shiftRightUnsigned = long.shiftRightUnsigned
const copy = long.copy

// Ported from https://github.com/v8/v8/blob/a3b02dc76d8e8f4e4ee3848fe1e6c009952fc24b/src/base/utils/random-number-generator.cc#L222-L229
const Multiply1 = { low: 0xFF51AFD7 | 0, high: 0xED558CCD | 0 }
const Multiply2 = { low: 0xC4CEB9FE | 0, high: 0x1A85EC53 | 0 }
const Temp = { low: 0 | 0, high: 0 | 0 }
const Temp2 = { low: 0 | 0, high: 0 | 0 }

function addChar (code, target, offset) {
  var pos = offset % 8
  if (pos === 0) {
    Temp2.low = 0
    Temp2.high = 0
  }
  if (pos === 2 || pos === 3) {
    code = code << 8
  } else if (pos === 4 || pos === 5) {
    code = code << 16
  } else if (pos === 6 || pos === 7) {
    code = code << 24
  }
  if (pos % 2 === 0) {
    Temp2.low ^= code
  } else {
    Temp2.high ^= code
  }
  if (pos === 7) {
    xor(target, murmurhash3Long(Temp2, Temp2), target)
    return true
  } else {
    return false
  }
}

function murmurhash3String (string, target) {
  target.low = 0
  target.high = 0

  var clean = true
  for (var i = 0, offset = 0; i < string.length; i++, offset++) {
    var code = string.charCodeAt(i)
    if (code >= 256) {
      // Unicode
      addChar(code & 0xff, target, offset)
      clean = addChar((code & 0xff00) >> 8, target, ++offset)
    } else {
      clean = addChar(code, target, offset)
    }
  }
  if (!clean) {
    murmurhash3Long(Temp2, Temp2)
    xor(target, Temp2, target)
  }
  return target
}

function murmurhash3Long (h, target) {
  if (h !== target) {
    copy(h, target)
  }
  shiftRightUnsigned(target, 33, Temp)
  xor(target, Temp, target)
  multiply(target, Multiply1, target, true)
  shiftRightUnsigned(target, 33, Temp)
  xor(target, Temp, target)
  multiply(target, Multiply2, target, true)
  shiftRightUnsigned(target, 33, Temp)
  xor(target, Temp, target)
  return target
}

module.exports = {
  murmurhash3Long: murmurhash3Long,
  murmurhash3String: murmurhash3String
}
