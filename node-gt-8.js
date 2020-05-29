const crypto = require('crypto')

module.exports = function getRandomValuesNodeGt8 (input) {
  return crypto.randomFillSync(input)
}
