const tape = require('fresh-tape')
const Writable = require('readable-stream').Writable

const element = document.getElementById('output')
element.focus()
const stream = new Writable({
  write: function (data, _, next) {
    element.value += data.toString()
    next()
  }
})
stream.on('error', function () {
  console.log('error!')
})
const harness = tape.getHarness({
  exit: false,
  stream: stream
})
let failed = false
harness.onFailure(function () {
  failed = true
})
harness.onFinish(function () {
  document.title = 'failed: ' + failed
})
document.title = 'running tests...'

require('../dist/test')('getRandomValuesBrowser')
