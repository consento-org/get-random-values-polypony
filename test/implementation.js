const test = require('fresh-tape')
const getRandomValues = require('..')
const SAMPLES = 1024

function uintstr (uint8Array) {
  const arr = []
  for (let i = 0; i < uint8Array.length; i++) {
    arr[i] = uint8Array[i]
  }
  const str = arr.join(',')
  return str
}

module.exports = function (name) {
  getRandomValues.polyfill()

  const base = (typeof window !== 'undefined' ? window : global)
  const crypto = base.crypto

  test(name + ' - polyfill', function (t) {
    t.ok(typeof crypto.getRandomValues === 'function', 'crypto.getRandomValues should exist')
    if (name !== 'getRandomValuesBrowser') {
      t.equals(crypto.getRandomValues.name, name + 'Limited', 'the polyfill support should be limited')
    }
    testRandomOutput(t, new Uint8Array(1000), function (input) {
      return crypto.getRandomValues(input)
    })
    crypto.getRandomValues(new Uint8Array(65536))
    try {
      crypto.getRandomValues(new Uint8Array(65536 + 1))
      t.fail('too large uint8array')
    } catch (_) {}
    try {
      crypto.getRandomValues(new Float32Array(10))
      t.fail('Float32Array is supposed to throw')
    } catch (_) {}
    try {
      crypto.getRandomValues(new Float64Array(10))
      t.fail('Float64Array is supposed to throw')
    } catch (_) {}
    try {
      crypto.getRandomValues(new DataView(new ArrayBuffer(10)))
      t.fail('DataView is supposed to throw')
    } catch (_) {}
    if (base.BigInt64Array) {
      try {
        crypto.getRandomValues(new BigInt64Array(10))
        t.fail('BigInt64Array is supposed to throw')
      } catch (_) {}
      try {
        crypto.getRandomValues(new BigUint64Array(10))
        t.fail('BigUint64Array is supposed to throw')
      } catch (_) {}
    }
    t.end()
  })

  testInputs(' - polyfilled', function (input) {
    return crypto.getRandomValues(input)
  })

  test(name + ' - performance', function (t) {
    let size = 1000
    while (true) {
      const buffer = new Uint8Array(size)
      const start = Date.now()
      getRandomValues(buffer)
      const end = Date.now()
      const duration = end - start
      if (duration > 50) {
        t.ok(true, size + ' random values ' + duration + 'ms')
        break
      }
      size *= 10
    }
    t.end()
  })

  test(name + ' - name matches', function (t) {
    t.equals(getRandomValues.name, name)
    t.end()
  })

  testOffset('small data', new Uint8Array(48), 16, 16)
  testOffset('zero offset', new Uint8Array(48), 0, 16)
  testOffset('full length', new Uint8Array(48), 16, 48 - 16)
  testOffset('big offset', new Uint8Array((65536 * 2.5) | 0), (65536 * 0.5) | 0, (65536 * 1.2) | 0)
  testOffset('int32 array', new Int32Array(12), 16, 16)

  testInputs('')
  testInput('Float32Array', new Float32Array(SAMPLES / 4))
  testInput('Float64Array', new Float64Array(SAMPLES / 8))

  testInput('DataView', new DataView(new ArrayBuffer(SAMPLES)))
  testInput('large Uint8Array', new Uint8Array(65536 * 2.5))

  if (base.BigInt64Array) {
    testInput('BigInt64Array', new base.BigInt64Array(SAMPLES))
    testInput('BigUint64Array', new base.BigUint64Array(SAMPLES))
  }

  function testInputs (suffix, override) {
    testInput('Uint8ClampedArray' + suffix, new Uint8ClampedArray(SAMPLES), override)
    testInput('Uint8Array' + suffix, new Uint8Array(SAMPLES), override)
    testInput('Int8Array' + suffix, new Int8Array(SAMPLES), override)
    testInput('Uint16Array' + suffix, new Uint16Array(SAMPLES / 2), override)
    testInput('Int16Array' + suffix, new Int16Array(SAMPLES / 2), override)
    testInput('Uint32Array' + suffix, new Uint32Array(SAMPLES / 4), override)
    testInput('Int32Array' + suffix, new Int32Array(SAMPLES / 4), override)
  }

  function testInput (type, input, override) {
    test(name + ' - ' + type, function (t) {
      testRandomOutput(t, input, override || getRandomValues)
      t.end()
    })
  }

  function testOffset (name, original, offset, length) {
    const total = original.length
    test(name + ' - offset: ' + offset + '/' + length + ' of ' + total, function (t) {
      const input = new Uint8Array(original.buffer, offset, length)
      let after
      let afterStr
      let before
      let beforeStr
      if (offset > 0) {
        before = getRandomValues(new Uint8Array(original.buffer, 0, offset))
        beforeStr = uintstr(before)
        t.ok(stats(before).avgDiff !== 0, 'before needs to be filled')
      }
      if (length === 0 || length > 0) {
        after = getRandomValues(new Uint8Array(original.buffer, offset + length))
        afterStr = uintstr(after)
        t.ok(stats(after).avgDiff !== 0, 'after needs to be filled')
      }
      getRandomValues(input)
      if (before) {
        t.equals(uintstr(before), beforeStr, 'before ' + offset + ' is untouched')
      }
      if (after) {
        t.equals(uintstr(after), afterStr, 'after   ' + (offset + length) + ' is untouched')
      }
      t.end()
    })
  }
}

function stats (parts) {
  let max = Number.NEGATIVE_INFINITY
  let min = Number.POSITIVE_INFINITY
  let prev
  let totalDiff = 0
  for (let i = 0; i < parts.length; i++) {
    const value = parts[i]
    if (value > max) {
      max = value
    }
    if (value < min) {
      min = value
    }
    if (prev !== undefined) {
      totalDiff += Math.abs(prev - value)
    }
    prev = value
  }
  return { min: min, max: max, avgDiff: totalDiff / parts.length, diff: Math.abs(max - min) }
}

function testRandomOutput (t, input, getRandomValues) {
  const result = getRandomValues(input)
  t.same(result, input, 'the input is returned as output')
  const valueMax = 0xffffffff
  const valueMin = 0x00000000
  const unit = 1000 / valueMax
  const lowerThreshold = 0x40404040
  const upperThreshold = 0xc0c0c0c0
  const diffByValMin = 0.25
  const runStats = stats(new Uint32Array(input.buffer))
  const min = runStats.min
  const max = runStats.max
  const diff = runStats.diff
  const diffByVal = runStats.avgDiff / 0xFFFFFFFF
  t.ok(diffByVal >= diffByValMin, 'average difference by value: ' + diffByVal + ' >= ' + diffByValMin)
  t.ok(min >= valueMin, 'lower bounds: ' + min + ' >= ' + valueMin)
  t.ok(min < lowerThreshold, 'lower threshold: ' + min + ' > ' + lowerThreshold)
  t.ok(max <= valueMax, 'upper bounds: ' + max + ' <= ' + valueMax)
  t.ok(max > upperThreshold, 'upper threshold: ' + max + ' > ' + upperThreshold)
  const spectrum = ((diff * unit) | 0) / 10
  t.ok(spectrum > 75, 'spectrum used: ' + spectrum + '% or ' + diff + ' of ' + valueMax + ' (>75% required)')
}
