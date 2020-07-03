const React = require('react')
const {
  ScrollView,
  Text
} = require('react-native')
let App

const bodyGray = {
  backgroundColor: '#dddddd'
}
const bodyGreen = {
  backgroundColor: '#ddffdd'
}
const bodyRed = {
  backgroundColor: '#ffdddd'
}

try {
  const { publicURL } = require('./test.json')

  const { useState, useEffect } = React

  const tape = require('fresh-tape')
  const { Writable } = require('readable-stream')

  let output = `Running...\n`
  let listeners = new Set()

  let started = false
  let finished = -1
  function start () {
    if (started) return
    started = true
    const emit = (message) => {
      output += message
      for (const listener of listeners) {
        listener.write(message)
      }
    }
    const write = (message) => {
      if (finished !== -1) {
        // emit('Unexpected message ' + message + '\n')
        return
      }
      emit(message)
    }
    const end = (code, message) => {
      if (finished !== -1) {
        // emit('Unexpected message ' + message + ' [' + code + ']\n')
        return
      }
      finished = code
      emit(message + 'Sending to ' + publicURL + '...\n')
      fetch(publicURL, {
        method: 'post',
        body: JSON.stringify({
          finished,
          output
        })
      })
        .then(() => {
          emit('sent\n')
          for (const listener of listeners) {
            listener.end(finished)
          }
        }, err => emit('...send error:\n' + err.message + '\n' + err.stack + '\n'))
    }
    const renderError = (error, isFatal) =>
      end(1, (isFatal ? '[FATAL] ' : '') + (error.message + '\n' + error.stack + '\n'))

    // global.ErrorUtils.setGlobalHandler(renderError)
    /*
    console.error = console.warning = (...args) => {
      const error = args.find(entry => entry instanceof Error)
      if (error) {
        renderError(error, false)
      } else {
        end(1, JSON.stringify(args) + '\n')
      }
    }
    console.log = console.info = (...args) => {
      const error = args.find(entry => entry instanceof Error)
      if (error) {
        write('[ERROR]' + error.message + '\n' + (error.stack || error.toString()) + '\n', false)
      } else {
        write('[LOG]' + JSON.stringify(args) + '\n')
      }
    }
    */
    const stream = new Writable({
      write: function (data, _, next) {
        emit(data.toString())
        next()
      }
    })
    stream.on('error', err => console.error(err))
    const harness = tape.getHarness({
      exit: false,
      stream: stream
    })
    harness.onFailure(() => end(1, 'error.\n'))
    harness.onFinish(() => end(0, 'done.\n'))
    try {
      require('get-random-values-polypony/test/index.js')('getRandomValuesSeed')
    } catch (err) {
      end(1, err)
    }
  }

  App = () => {
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
} catch (err) {
  App = () => {
    console.error(err)
    return (
      <>
        <ScrollView contentInsetAdjustmentBehavior="automatic" style={bodyRed}>
          <Text selectable={ true }>{ String(err.stack || err.message || err) }</Text>
        </ScrollView>
      </>
    )
  }
}

module.exports = App
