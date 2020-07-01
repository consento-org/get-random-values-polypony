
module.exports = function (name) {
  require('./long.js')
  require('./entropyFromUUID.js')
  require('./createRandomSeed.js')
  require('./murmurhash3.js')
  require('./implementation.js')(name)
}
