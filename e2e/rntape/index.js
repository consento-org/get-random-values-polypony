const { AppRegistry } = require('react-native')
const App = require('./App')
const { name: appName } = require('./app.json')

AppRegistry.registerComponent(appName, () => App)
