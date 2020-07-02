const crypto = require('crypto')
const getRandomValuesNodeLt8 = require('./node-randomBytes.js')

module.exports = function getRandomValuesRandomFillUint8 (input) {
  if (input instanceof Uint8Array) {
    return crypto.randomFillSync(input)
  }
  return getRandomValuesNodeLt8(input)
}
