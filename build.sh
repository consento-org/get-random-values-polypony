#!/bin/bash

rm -r dist 2> /dev/null
mkdir -p dist/test
cp -r Readme.md LICENSE *.podspec ios android dist
for file in *.js test/*.js; do
  echo "Building $file"
  npx -q babel -o dist/$file -s true $file
done

node -p "pkg = require('./package.json'); delete pkg.private; JSON.stringify(pkg)" > dist/package.json
