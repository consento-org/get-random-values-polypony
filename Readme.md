# get-random-values-polypony

![Standard & TypeScript definitions](https://github.com/consento-org/sync-randombytes/workflows/Linting%20the%20code/badge.svg)
![Device Tests](https://github.com/consento-org/sync-randombytes/workflows/Testing%20on%20devices/badge.svg)

`get-random-values-polypony` is a **thorougly tested**, normalizing [ponyfill](https://github.com/sindresorhus/ponyfill) for [`crypto.getRandomValues`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) with a [polyfill](https://en.wikipedia.org/wiki/Polyfill_(programming)) option.

- It is tested to work with **react-native**(ios, android), **expo**, node 6+, IE 11, Metro, Firefox, Safari
- No dependencies.

`npm i get-random-values-polypony --save`

## Usage

You can use it like an other randomBytes function by calling:

```javascript
const getRandomValues = require('get-random-values-polypony')
const randomUint8Array = getRandomValues(new Uint8Array(16))
```

Or setup the polyfill like:

```javascript
require('get-random-values-polypony').polyfill()

crypto.getRandomValues(new Uint8Array(16))
```

## Why?

### Normalizing behavior both in ponyfill and polyfill

The polyfill respects _(unlike other implementations)_ that the native `crypto.getRandomValues` do not support `Float32Array`, `Float64Array`, `DataView`, `BigInt64Array` or `BigUint64Array` and behaves likewise on node/react-native.
Similarly the `crypto.getRandomValues` polyfill does not accept a `ArrayBuffer` that has more than `65536` bytes.

The `ponyfill` on the other hand will accept all native `ArrayBufferView` implementations at any size, on all platforms.

### Expo support

This library works out-of-the-box with [`expo`](https://expo.io) - no additional setup needed.

### No dependencies

Other react-native implementations use `base64` to process the native data in JavaScript, this implementation works around this by using `hex` encoded data which can be easily processed without a library (also: it uses less data).

Some other implementations use like this a random-seed implementations. Those dependencies are often part of a bigger crypto suite that comes with dependencies and dependencies of dependencies, bloating the package tree while not necessarily improving the safety.

### Chrome logic for react-native

To implement it for react-native, this library ported google chrome's random implementation to javascript. The advantage of google's implementation is the small initial random value (64bit) which is easy to supply - even in expo.
It should also come with the same level of security as chrome does.

### Non-blocking

Other implementations such as [react-native-get-random-values](https://github.com/LinusU/react-native-get-random-values) use blocking native calls in react-native that may create locks between the native and JS thread.
`get-random-values-polypony` only requires a secure initial seed, like browsers and the rest is executed on the javascript thread.

## License

[MIT](./LICENSE)
