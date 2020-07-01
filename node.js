const crypto = require('crypto')
const getRandomValues = crypto.randomFillSync
  ? (/^v8\./.test(process.version)
    ? require('./node-eq-8.js')
    : require('./node-gt-8.js')
  )
  : require('./node-lt-8.js')
getRandomValues.polyfill = function () {
  if (!('crypto' in global)) {
    global.crypto = {}
  }
  if (!('getRandomValues' in global.crypto)) {
    global.crypto.getRandomValues = require('./browserLimitations.js')(getRandomValues)
  }
}

module.exports = getRandomValues
