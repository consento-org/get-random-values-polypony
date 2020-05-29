/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, { useState, useEffect } from 'react'

import tape from 'tape'
import { Writable } from 'readable-stream'
import {
  ScrollView,
  Text
} from 'react-native'

let output = ''
let listeners = new Set()

const bodyGray = {
  backgroundColor: '#dddddd'
}
const bodyGreen = {
  backgroundColor: '#ddffdd'
}
const bodyRed = {
  backgroundColor: '#ffdddd'
}

let started = false
let finished = -1
function start () {
  if (started) return
  started = true
  const stream = new Writable({
    write: function (data, _, next) {
      const datastr = data.toString()
      output += datastr
      for (const listener of listeners) {
        listener.write(datastr)
      }
      next()
    }
  })
  stream.on('error', function () {
    console.log('error!')
  })
  const harness = tape.getHarness({
    exit: false,
    stream: stream
  })
  harness.onFailure(function () {
    finished = 1
  })
  harness.onFinish(function () {
    if (finished === -1) {
      finished = 0
    }
    for (const listener of listeners) {
      listener.end(finished)
    }
  })
  require('@consento/sync-randombytes/test/index.js')('getRandomValuesSeed')
}

const App = () => {
  const [test, setState] = useState(() => ({ output: '', finished: -1 }))

  useEffect(() => {
    setState({ output, finished })
    const listener = {
      write () {
        setState({ output, finished })
      },
      end () {
        setState({ output, finished })
      }
    }
    listeners.add(listener)
    setTimeout(start, 100)
    return () => {
      listeners.delete(listener)
    }
  }, [])
  return (
    <>
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={test.finished === 0 ? bodyGreen : test.finished === 1 ? bodyRed : bodyGray}>
        <Text selectable={ true }>{ test.output ? test.output : 'Running...\n' }</Text>
      </ScrollView>
    </>
  )
}

module.exports = App
