const crypto = require('crypto')
const isLegacyRandomFill = /^v(\d+)/.exec(process.version)[1] < 9
const getRandomValues = crypto.randomFillSync
  ? (
    isLegacyRandomFill ? require('./node-randomFillUint8.js')
    : require('./node-randomFill.js')
  )
  : require('./node-randomBytes.js')

getRandomValues.polyfill = function () {
  if (!('crypto' in global)) {
    global.crypto = {}
  }
  if (!('getRandomValues' in global.crypto)) {
    global.crypto.getRandomValues = require('./browserLimitations.js')(getRandomValues)
  }
}

module.exports = getRandomValues
