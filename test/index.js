
module.exports = function (name, lowEntropy) {
  require('./long.js')
  require('./entropyFromUUID.js')
  require('./createRandomSeed.js')
  require('./murmurhash3')
  require('./implementation')(name, lowEntropy)
}
