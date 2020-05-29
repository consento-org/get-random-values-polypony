const test = require('tape')
test('hello', t => {
  console.log('world')
  t.ok(false, 'hi')
  t.end()
})
