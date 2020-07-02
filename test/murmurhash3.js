const test = require('fresh-tape')
const lng = require('../long.js')
const xor = lng.xor
const murmur = require('../murmurhash3.js')
const murmurhash3Long = murmur.murmurhash3Long
const murmurhash3String = murmur.murmurhash3String
const TMP = { low: 0|0, high: 0|0 }
const TMP2 = { low: 0|0, high: 0|0 }
const TMP3 = { low: 0|0, high: 0|0 }

const data = [
  { input: { low: 1, high: 0 }, result: { low: 159932351, high: 1569927747 } },
  { input: { low: 0, high: 0 }, result: { low: 0, high: 0 } },
  { input: { low: 0, high: 1 }, result: { low: 800744850, high: -299444368 } },
  { input: { low: 3424112, high: 4234234 }, result: { low: -527662042, high: 794622717 } },
  { input: { low: 0, high: 131414123123 }, result: { low: 776941238, high: 1035631136 } }
]

test('murmurhash3Number', function (t) {
  data.forEach(function (obj) {
    const input = obj.input
    const result = obj.result
    const output = { low: 0, high: 0 }
    murmurhash3Long(input, output)
    t.deepEquals(output, result, '{low:' + input.low + ',high:' + input.high + '}')
  })
  t.end()
})

test('murmurhash3String', function (t) {
  const simple = function (input, expectedOut) { t.deepEquals(murmurhash3String(input, TMP), murmurhash3Long(expectedOut, TMP2), '"' + encodeURIComponent(input) + '"') }
  simple('a', { low: 97, high: 0 })
  simple('\x00a', { low: 0, high: 97 })
  simple('\x00\x00a', { low: 24832, high: 0 })
  simple('\x00\x00\x00a', { low: 0, high: 24832 })
  simple('\x00\x00\x00\x00a', { low: 6356992, high: 0 })
  simple('\x00\x00\x00\x00\x00a', { low: 0, high: 6356992 })
  simple('\x00\x00\x00\x00\x00\x00a', { low: 1627389952, high: 0 })
  simple('\x00\x00\x00\x00\x00\x00\x00a', { low: 0, high: 1627389952 })
  simple('\x00\x00\x00\x00\x00\x00\x00\x00a', { low: 97, high: 0 })
  simple('abcdefgh', { low: 1734697825, high: 1751540834 })

  t.deepEquals(
    murmurhash3String('abcdefghijklmnop', TMP),
    xor(
      murmurhash3Long({ low: 1734697825, high: 1751540834 }, TMP2),
      murmurhash3Long({ low: 1869441897, high: 1886284906 }, TMP3),
      TMP3
    ),
    '"abcdefghijklmnop"'
  )
  t.deepEquals(
    murmurhash3String('abcdefghijkl', TMP), 
    xor(
      murmurhash3Long({ low: 1734697825, high: 1751540834 }, TMP2),
      murmurhash3Long({ low: 27497, high: 27754 }, TMP3),
      TMP3
    ),
    '"abcdefghijkl"'
  )
  t.end()
})
