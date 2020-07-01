#!/bin/bash

rm -r dist 2> /dev/null
mkdir -p dist/test
cp -r Readme.md LICENSE *.podspec ios android dist
./babelBuild *.js test/*.js

node -p "pkg = require('./package.json'); delete pkg.private; JSON.stringify(pkg, null, 2)" > dist/package.json
