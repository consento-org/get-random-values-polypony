/**
 * @format
 */
// global.Buffer = require('buffer').Buffer
global.Buffer = class {
  constructor() {
    
  }
}
global.Buffer.from = function () {
  console.log(new Error().stack)
}
global.Buffer.allocUnsafe = function () {
  console.log(new Error().stack)
}
/*
process.browser = true
process.nextTick = setImmediate
process.cwd = function () {
  return '.'
}
global.__dirname = '.'
*/

const { AppRegistry } = require('react-native')
const App = require('./App')
const { name: appName } = require('./app.json')

AppRegistry.registerComponent(appName, () => App)
