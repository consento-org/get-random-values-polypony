const crypto = require('crypto')

module.exports = function getRandomValuesRandomFill (input) {
  return crypto.randomFillSync(input)
}
