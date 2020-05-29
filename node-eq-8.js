const crypto = require('crypto')
const getRandomValuesNodeLt8 = require('./node-lt-8.js')

module.exports = function getRandomValuesNodeEq8 (input) {
  if (input instanceof Uint8Array) {
    return crypto.randomFillSync(input)
  }
  return getRandomValuesNodeLt8(input)
}
