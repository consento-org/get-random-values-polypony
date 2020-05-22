const TWO_PWR_16_DBL = 1 << 16
const TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL
const TWO_PWR_24_DBL = 1 << 24
const TWO_PWR_24 = fromInt(TWO_PWR_24_DBL)
const TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL
const TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2
const MIN_VALUE = { low: 0 | 0, high: 0x80000000 | 0 }
const MAX_VALUE = { low: 0xFFFFFFFF | 0, high: 0x7FFFFFFF | 0 }
const MAX_UNSIGNED_VALUE = { low: 0xFFFFFFFF | 0, high: 0xFFFFFFFF | 0 }
const ONE = fromInt(1)
const ZERO = fromInt(0)
const UZERO = fromInt(0, true)
const TMP_COMPARE = fromInt(0)
const TMP_MULTI1 = fromInt(0)
const TMP_MULTI2 = fromInt(0)
const TMP_SUBTRACT = fromInt(0)
const TMP_NEGATE = fromInt(0)

function fromInt (value, unsigned) {
  if (unsigned) {
    value >>>= 0
    return { low: value, high: (value | 0) < 0 ? -1 : 0 }
  }
  value |= 0
  return { low: value, high: value < 0 ? -1 : 0 }
}

function toNumber (long, unsigned) {
  if (unsigned) {
    return ((long.high >>> 0) * TWO_PWR_32_DBL) + (long.low >>> 0)
  }
  return long.high * TWO_PWR_32_DBL + (long.low >>> 0)
}

function isZero (long) {
  return long.low === 0 && long.high === 0
}

function isOdd (long) {
  return (long.low & 1) === 1
}

function eq (a, b) {
  return a.high === b.high && a.low === b.low
}

function isNegative (long, unsigned) {
  return !unsigned && long.high < 0
}

/*
function toString (long) {
  radix = radix || 10
  if (radix < 2 || 36 < radix) {
    throw RangeError('radix')
  }
  if (isZero(long)) {
    return '0'
  }
  if (isNegative(long)) {
    if (this.eq(MIN_VALUE)) {
      // We need to change the Long value before it can be negated, so we remove
      // the bottom-most digit in this base and then recurse to do the rest.
      var radixLong = fromNumber(radix)
      const div = divison(long, radixLong)
      const rem1 = multiply(div, radixLong).sub(this);
      return toString(div, radix) + toInt(rem1).toString(radix)
    } else
      return '-' + toString(negate(long, TMP_TOSTRING), radix)
    }
  }

  // Do several (6) digits each time through the loop, so as to
  // minimize the calls to the very expensive emulated div.
  var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
      rem = this;
  var result = '';
  while (true) {
      var remDiv = rem.div(radixToPower),
          intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero())
          return digits + result;
      else {
          while (digits.length < 6)
              digits = '0' + digits;
          result = '' + digits + result;
      }
  }
}
*/

// Ported from https://github.com/dcodeIO/long.js/blob/ce11b4b2bd3ba1240a057d62018563d99db318f9/src/long.js#L808-L843
function add (long, other, target) {
  // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
  const a48 = long.high >>> 16
  const a32 = long.high & 0xFFFF
  const a16 = long.low >>> 16
  const a00 = long.low & 0xFFFF

  const b48 = other.high >>> 16
  const b32 = other.high & 0xFFFF
  const b16 = other.low >>> 16
  const b00 = other.low & 0xFFFF

  let c00 = a00 + b00
  let c16 = c00 >>> 16
  c00 &= 0xFFFF
  c16 += a16 + b16
  let c32 = c16 >>> 16
  c16 &= 0xFFFF
  c32 += a32 + b32
  let c48 = c32 >>> 16
  c32 &= 0xFFFF
  c48 += a48 + b48
  c48 &= 0xFFFF

  target.low = (c16 << 16) | c00
  target.high = (c48 << 16) | c32
  return target
}

function not (long, target) {
  target.low = ~long.low
  target.high = ~long.high
  return target
}

function xor (long, other, target) {
  target.low = long.low ^ other.low
  target.high = long.high ^ other.high
  return target
}

function and (long, other, target) {
  target.low = long.low & other.low
  target.high = long.high & other.high
  return target
}

function negate (long, target, unsigned) {
  if (!unsigned && eq(long, MIN_VALUE)) {
    return copy(MIN_VALUE, target)
  }
  return add(not(long, TMP_NEGATE), ONE, target)
}

function subtract (long, subtrahend, target, unsigned) {
  return add(long, negate(subtrahend, TMP_SUBTRACT, unsigned), target)
}

function compare (a, b, unsigned) {
  if (eq(a, b)) {
    return 0
  }
  const aNeg = isNegative(a, unsigned)
  const bNeg = isNegative(b, unsigned)
  if (aNeg && !bNeg) {
    return -1
  }
  if (!aNeg && bNeg) {
    return 1
  }
  // At this point the sign bits are the same
  if (!unsigned) {
    return isNegative(subtract(a, b, TMP_COMPARE, unsigned), unsigned) ? -1 : 1
  }
  // Both are positive if at least one is unsigned
  return (b.high >>> 0) > (a.high >>> 0) || (b.high === a.high && (b.low >>> 0) > (a.low >>> 0)) ? -1 : 1
}

function lt (a, b, unsigned) {
  return compare(a, b, unsigned) < 0
}

function multiplyRaw (long, multiplier, target, unsigned) {
  // If both longs are small, use float multiplication
  if (lt(long, TWO_PWR_24, unsigned) && lt(multiplier, TWO_PWR_24, unsigned)) {
    const numa = toNumber(long, unsigned)
    const numb = toNumber(multiplier, unsigned)
    const multiplied = numa * numb
    fromNumber(multiplied, target, unsigned)
    return target
  }

  // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
  // We can skip products that would overflow.

  const a48 = long.high >>> 16
  const a32 = long.high & 0xFFFF
  const a16 = long.low >>> 16
  const a00 = long.low & 0xFFFF

  const b48 = multiplier.high >>> 16
  const b32 = multiplier.high & 0xFFFF
  const b16 = multiplier.low >>> 16
  const b00 = multiplier.low & 0xFFFF

  let c00 = a00 * b00
  let c16 = c00 >>> 16
  c00 &= 0xFFFF
  c16 += a16 * b00
  let c32 = c16 >>> 16
  c16 &= 0xFFFF
  c16 += a00 * b16
  c32 += c16 >>> 16
  c16 &= 0xFFFF
  c32 += a32 * b00
  let c48 = c32 >>> 16
  c32 &= 0xFFFF
  c32 += a16 * b16
  c48 += c32 >>> 16
  c32 &= 0xFFFF
  c32 += a00 * b32
  c48 += c32 >>> 16
  c32 &= 0xFFFF
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48
  c48 &= 0xFFFF

  target.low = (c16 << 16) | c00
  target.high = (c48 << 16) | c32
  return target
}

// Ported from: https://github.com/dcodeIO/long.js/blob/ce11b4b2bd3ba1240a057d62018563d99db318f9/src/long.js#L161-L178
function fromNumber (value, target, unsigned) {
  if (isNaN(value)) {
    return copy(unsigned ? UZERO : ZERO, target)
  }
  if (unsigned) {
    if (value < 0) {
      return copy(UZERO, target)
    }
    if (value >= TWO_PWR_64_DBL) {
      return copy(MAX_UNSIGNED_VALUE, target)
    }
  } else {
    if (value <= -TWO_PWR_63_DBL) {
      return copy(MIN_VALUE, target)
    }
    if (value + 1 >= TWO_PWR_63_DBL) {
      return copy(MAX_VALUE, target)
    }
    if (value < 0) {
      return negate(fromNumber(-value, target, unsigned), target, unsigned)
    }
  }
  target.low = (value % TWO_PWR_32_DBL) | 0
  target.high = (value / TWO_PWR_32_DBL) | 0
  return target
}

// Ported from https://github.com/dcodeIO/long.js/blob/ce11b4b2bd3ba1240a057d62018563d99db318f9/src/long.js#L865-L940
function multiply (long, multiplier, target, unsigned) {
  if (isZero(long) || isZero(multiplier)) {
    target.low = 0
    target.high = 0
    return target
  }

  if (eq(long, MIN_VALUE)) {
    return copy(isOdd(multiplier) ? MIN_VALUE : ZERO, target)
  }

  if (eq(multiplier, MIN_VALUE)) {
    return copy(isOdd(long) ? MIN_VALUE : ZERO, target)
  }

  if (isNegative(long, unsigned)) {
    negate(long, TMP_MULTI1, unsigned)
    if (isNegative(multiplier, unsigned)) {
      negate(multiplier, TMP_MULTI2, unsigned)
      multiplyRaw(TMP_MULTI1, TMP_MULTI2, target, unsigned)
    } else {
      multiplyRaw(TMP_MULTI1, multiplier, TMP_MULTI2, unsigned)
      negate(TMP_MULTI2, target, unsigned)
    }
    return target
  }

  if (isNegative(multiplier, unsigned)) {
    negate(multiplier, TMP_MULTI1, unsigned)
    multiplyRaw(long, TMP_MULTI1, TMP_MULTI2, unsigned)
    negate(TMP_MULTI2, target, unsigned)
    return target
  }
  return multiplyRaw(long, multiplier, target, unsigned)
}

function copy (source, target) {
  target.low = source.low
  target.high = source.high
  return target
}

module.exports = {
  isZero,
  isOdd,
  eq,
  lt,
  compare,
  // Ported from https://github.com/dcodeIO/long.js/blob/ce11b4b2bd3ba1240a057d62018563d99db318f9/src/long.js#L1157-L1172
  shiftRight (long, numBits, target) {
    if ((numBits &= 63) === 0) {
      target.low = long.low
      target.high = long.high
    } else if (numBits < 32) {
      target.low = (long.low >>> numBits) | (long.high << (32 - numBits))
      target.high = long.high >> numBits
    } else {
      target.low = long.high >> (numBits - 32)
      target.high = long.high >= 0 ? 0 : -1
    }
    return target
  },
  // Ported from https://github.com/dcodeIO/long.js/blob/ce11b4b2bd3ba1240a057d62018563d99db318f9/src/long.js#L1207-L1219
  shiftRightUnsigned (long, numBits, target) {
    if ((numBits &= 63) === 0) {
      target.low = long.low
      target.high = long.high
    } else if (numBits < 32) {
      target.low = (long.low >>> numBits) | (long.high << (32 - numBits))
      target.high = long.high >>> numBits
    } else if (numBits === 32) {
      target.low = long.high
      target.high = 0
    } else {
      target.low = long.high >>> (numBits - 32)
      target.high = 0
    }
    return target
  },
  // Ported from https://github.com/dcodeIO/long.js/blob/ce11b4b2bd3ba1240a057d62018563d99db318f9/src/long.js#L1213-L1219
  shiftLeft (long, numBits, target) {
    if ((numBits &= 63) === 0) {
      target.low = long.low
      target.high = long.high
    } else if (numBits < 32) {
      target.low = long.low << numBits
      target.high = (long.high << numBits) | (long.low >>> (32 - numBits))
    } else {
      target.low = 0
      target.high = long.low << (numBits - 32)
    }
    return target
  },
  multiply,
  add,
  subtract,
  xor,
  and,
  not,
  copy,
  negate,
  fromInt,
  toNumber,
  fromNumber
}
