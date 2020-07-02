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

  test(name + ' - polyfill', function (t) {
    getRandomValues.polyfill()
    const base = typeof window !== 'undefined' ? window : global
    t.ok(typeof base.crypto.getRandomValues === 'function', 'crypto.getRandomValues should exist')
    if (name !== 'getRandomValuesBrowser') {
      t.equals(crypto.getRandomValues.name, name + 'Limited', 'the polyfill support should be limited')
    }
    testRandomOutput(t, new Uint8Array(1000), function (input) {
      return base.crypto.getRandomValues(input)
    })
    t.end()
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

  testInput('Uint8ClampedArray', new Uint8ClampedArray(SAMPLES))
  testInput('Uint8Array', new Uint8Array(SAMPLES))
  testInput('Int8Array', new Int8Array(SAMPLES))
  testInput('Uint16Array', new Uint16Array(SAMPLES / 2))
  testInput('Int16Array', new Int16Array(SAMPLES / 2))
  testInput('Uint32Array', new Uint32Array(SAMPLES / 4))
  testInput('Int32Array', new Int32Array(SAMPLES / 4))
  testInput('Float32Array', new Float32Array(SAMPLES / 4))
  testInput('Float64Array', new Float64Array(SAMPLES / 8))
  testInput('large Uint8Array', new Uint8Array(65536 * 2.5))
  const array = new ArrayBuffer(SAMPLES)
  testInput('DataView', new DataView(array))

  testOffset('small data', new Uint8Array(48), 16, 16)
  testOffset('zero offset', new Uint8Array(48), 0, 16)
  testOffset('full length', new Uint8Array(48), 16, 48 - 16)
  testOffset('big offset', new Uint8Array((65536 * 2.5) | 0), (65536 * 0.5) | 0, (65536 * 1.2) | 0)
  testOffset('int32 array', new Int32Array(12), 16, 16)

  return
  function testInput (type, input) {
    test(name + ' - ' + type, function (t) {
      testRandomOutput(t, input, getRandomValues)
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
  t.same(result, input, 'the value is only filled!')
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
