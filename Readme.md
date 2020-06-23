# sync-randombytes

<a href="https://travis-ci.org/consento-org/sync-randombytes"><img src="https://travis-ci.org/consento-org/sync-randombytes.svg?branch=master" alt="Build Status"/></a>
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

`@consento/sync-randombytes` is a [ponyfill](https://github.com/sindresorhus/ponyfill) and optionally a polyfill for [`crypto.getRandomValues`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) that is tested in `node`, various browsers, react-native _(with support for versions &lt; 0.60)_ and expo.

`npm i @consento/sync-randombytes --save`

## Usage

You can use it like an other randomBytes function by calling:

```javascript
const getRandomValues = require('@consento/sync-randombytes')
const randomUint8Array = getRandomValues(new Uint8Array(16))
```

Or it has the polyfill that looks like:

```javascript
require('@consento/sync-randombytes').polyfill()

crypto.getRandomValues(new Uint8Array())
```

## Why?

- React-native < 0.60 does not support crypto.randomBytes and you need a custom solution to implement a sync random method
- Metro bundlers complain when you try to use [`react-native-randombytes`](https://www.npmjs.com/package/react-native-randombytes) as it's dependencies try to `require('crypto')` - which is not available in react-native. 

## Browser

(Ponyfill only!)

In browsers there are limitations to `getRandomValues()` that do not exist in Node, for example: the number of bytes you can pass in to
`getRandomValues()` is limited, in some browsers `Float*Array`s are not supported, etc. If you use the polyfill `const getRandomValues = require('@consento/sync-randombytes)` those things will work the same accross platform, while the polyfill will not modify browser API's and instead behave the same way as browser do (by throwing errors if the wrong types are used).

## How it works?

- It uses [`window.crypto.getRandomBytes`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) if available (which is every browser that properly supports TypedArrays; IE11, Chrome, Safari, etc.)
- If 'crypto' can be "required" it will use
    - from node > 6.13: [`crypo.randomFill`](https://nodejs.org/api/crypto.html#crypto_crypto_randomfill_buffer_offset_size_callback) - or a polyfill that implements it using crypto.randomBytes for node < 6.1
- .. else it uses a ported version of `v8`'s seed-randomNumber generator.
    - with a randomseed from a native environment module
    - or a randomseed using the [expo random API](https://docs.expo.io/versions/latest/sdk/random/)

## License

[MIT](./LICENSE)

with some source code adopted from [`react-native-randombytes`](https://www.npmjs.com/package/react-native-randombytes)
