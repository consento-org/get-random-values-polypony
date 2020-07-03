import getRandomValues = require('../dist')
import tape = require('fresh-tape')

const { polyfill } = getRandomValues

tape('test', t => {
  notEmpty<Uint8Array>(t, getRandomValues(new Uint8Array(100)))
  notEmpty<Int8Array>(t, getRandomValues(new Int8Array(100)))
  notEmpty<Uint8ClampedArray>(t, getRandomValues(new Uint8ClampedArray(100)))
  notEmpty<Uint16Array>(t, getRandomValues(new Uint16Array(100)))
  notEmpty<Int16Array>(t, getRandomValues(new Int16Array(100)))
  notEmpty<Uint32Array>(t, getRandomValues(new Uint32Array(100)))
  notEmpty<Int32Array>(t, getRandomValues(new Int32Array(100)))
  notEmpty<Float32Array>(t, getRandomValues(new Float32Array(100)))
  notEmpty<Float64Array>(t, getRandomValues(new Float64Array(100)))
  notEmpty<BigInt64Array>(t, getRandomValues(new BigInt64Array(100)))
  notEmpty<BigUint64Array>(t, getRandomValues(new BigUint64Array(100)))
  notEmpty<DataView>(t, getRandomValues(new DataView(new ArrayBuffer(100))))
  t.equals(typeof getRandomValues.name, 'string')
  t.same(getRandomValues.polyfill(), undefined)
  t.same(polyfill(), undefined)
  t.end()
})

function notEmpty<T extends ArrayBufferView> (t: any, input: T) {
  const uint8 = new Uint8Array(input.buffer)
  let max = -Number.MAX_VALUE
  let min = Number.MAX_VALUE
  for (let i = 0; i < uint8.length; i++) {
    const val = uint8[i]
    min = Math.min(min, val)
    max = Math.max(max, val)
  }
  const diff = max - min
  t.notEquals(diff, 0)
}
