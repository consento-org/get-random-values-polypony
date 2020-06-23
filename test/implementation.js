const test = require('fresh-tape')
const getRandomValues = require('..')
const SAMPLES = 1024

module.exports = function (name, lowEntropy) {
  test(name + ' - entropy information', function (t) {
    t.equals(getRandomValues.lowEntropy, lowEntropy, 'lowEntropy is expected to be ' + lowEntropy)
    getRandomValues.highEntropyPromise.then(
      function () {
        t.equals(getRandomValues.lowEntropy, false, 'auto-fixes low entropy')
        t.end()
      },
      function (err) {
        t.fail(err)
        t.end()
      }
    )
  })

  test(name + ' - polyfill', function (t) {
    getRandomValues.polyfill().then(
      function () {
        t.equals(getRandomValues.lowEntropy, false, 'lowentropy should have settled')
        const base = typeof window !== 'undefined' ? window : global
        t.ok(typeof base.crypto.getRandomValues === 'function', 'crypto.getRandomValues should exist')
        if (name !== 'getRandomValuesBrowser') {
          t.equals(crypto.getRandomValues.name, name + 'Limited', 'the polyfill support should be limited')
        }
        testRandomOutput(t, new Uint8Array(1000), function (input) {
          return base.crypto.getRandomValues(input)
        })
        t.end()
      },
      function (err) {
        t.fail(err)
        t.end()
      }
    )
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
  const array = new ArrayBuffer(SAMPLES)
  testInput('DataView', new DataView(array))

  function testInput (type, input) {
    test(name + ' - ' + type, function (t) {
      testRandomOutput(t, input, getRandomValues)
      t.end()
    })
  }
}

function stats (parts) {
  let max = Number.NEGATIVE_INFINITY
  let min = Number.POSITIVE_INFINITY
  for (let i = 0; i < parts.length; i++) {
    const value = parts[i]
    if (value > max) {
      max = value
    }
    if (value < min) {
      min = value
    }
  }
  return { min: min, max: max, diff: Math.abs(max - min) }
}

function testRandomOutput (t, input, getRandomValues) {
  const result = getRandomValues(input)
  t.same(result, input, 'the value is only filled!')
  const valueMax = 0xffffffff
  const valueMin = 0x00000000
  const unit = 1000 / valueMax
  const lowerThreshold = 0x40404040
  const upperThreshold = 0xc0c0c0c0
  const runStats = stats(new Uint32Array(input.buffer))
  const min = runStats.min
  const max = runStats.max
  const diff = runStats.diff
  t.ok(min >= valueMin, 'lower bounds: ' + min + ' >= ' + valueMin)
  t.ok(min < lowerThreshold, 'lower threshold: ' + min + ' > ' + lowerThreshold)
  t.ok(max <= valueMax, 'upper bounds: ' + max + ' <= ' + valueMax)
  t.ok(max > upperThreshold, 'upper threshold: ' + max + ' > ' + upperThreshold)
  const spectrum = ((diff * unit) | 0) / 10
  t.ok(spectrum > 75, 'spectrum used: ' + spectrum + '% or ' + diff + ' of ' + valueMax + ' (>75% required)')
}
