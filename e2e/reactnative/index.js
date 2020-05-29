/**
 * @format
 */
global.Buffer = require('buffer').Buffer
process.browser = true
process.nextTick = setImmediate
process.cwd = function () {
  return '.'
}
global.__dirname = '.'

console.log(Buffer.from('abcd').toString('hex'))

const { AppRegistry } = require('react-native')
const App = require('./App')
const { name: appName } = require('./app.json')

AppRegistry.registerComponent(appName, () => App)
