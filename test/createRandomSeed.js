const test = require('fresh-tape')
const createRandomSeed = require('../createRandomSeed.js')

function uintstr (uint8Array) {
  const arr = []
  for (let i = 0; i < uint8Array.length; i++) {
    arr[i] = uint8Array[i]
  }
  const str = arr.join(',')
  return str
}

test('empty seeds do not work', function (t) {
  t.throws(function () { return createRandomSeed() }, 'no seed')
  t.throws(function () { return createRandomSeed(null) }, 'null seed')
  t.throws(function () { return createRandomSeed(undefined) }, 'undefined seed')
  t.throws(function () { return createRandomSeed('') }, '"" seed')
  t.throws(function () { return createRandomSeed([]) }, '[] seed')
  t.throws(function () { return createRandomSeed(0) }, '0 seed')
  t.end()
})

test('floating points as seed data', function (t) {
  const rng = createRandomSeed(0.5)
  t.equals(uintstr(rng(new Uint8Array(2))), '98,156')
  t.end()
})

test('Complex random seed', function (t) {
  const rng = createRandomSeed([0.5, 'hello', [1, { low: 1, high: 2 }, 'world'], 1])
  t.equals(uintstr(rng(new Uint8Array(6))), '227,56,24,50,65,169')
  t.end()
})

test('two same seeds mean two same results', function (t) {
  const rngA = createRandomSeed('a')
  const rngB = createRandomSeed('a')
  const dataA = rngA(new Uint8Array(10))
  const dataB = rngB(new Uint8Array(10))

  t.equals(uintstr(dataA), uintstr(dataB), 'random("a") === random("a")')
  t.end()
})

test('two different seeds mean two different results', function (t) {
  const rngA = createRandomSeed('a')
  const rngB = createRandomSeed('b')
  const dataA = rngA(new Uint8Array(10))
  const dataB = rngB(new Uint8Array(10))

  t.notEquals(uintstr(dataA), uintstr(dataB), 'random("a") != random("b")')
  t.end()
})

test('missing properties in arrays get ignored', function (t) {
  const rngA = createRandomSeed('a')
  const rngB = createRandomSeed(['a', null])
  const dataA = rngA(new Uint8Array(10))
  const dataB = rngB(new Uint8Array(10))

  t.equals(uintstr(dataA), uintstr(dataB), 'random("a") == random(["a", null])')
  t.end()
})

test('increasing entropy should return different results', function (t) {
  const rngA = createRandomSeed('a')
  const rngB = createRandomSeed('a')
  rngA.increaseEntropy('b')
  const dataA = rngA(new Uint8Array(10))
  const dataB = rngB(new Uint8Array(10))
  t.notEquals(uintstr(dataA), uintstr(dataB), 'random("a") != increase(random("a"), "b")')
  t.end()
})

test('different types', function (t) {
  const run = function (name, bufferView) {
    const rngBufferView = createRandomSeed('a')
    rngBufferView(bufferView)

    const uint8 = new Uint8Array(bufferView.buffer)
    const rngUint8 = createRandomSeed('a')
    rngUint8(uint8)

    t.equals(uintstr(new Uint8Array(bufferView.buffer)), uintstr(uint8), name + ' works same as Uint8Array')
  }
  run('Int8Array', new Int8Array(32))
  run('Uint8Array', new Uint8Array(32))
  run('Uint16Array', new Uint16Array(32))
  run('Uint32Array', new Uint32Array(32))
  run('Int16Array', new Int16Array(32))
  run('Int32Array', new Int32Array(32))
  run('Float32Array', new Float32Array(32))
  run('Float64Array', new Float64Array(32))
  run('DataView', new DataView(new ArrayBuffer(32)))
  t.end()
})
