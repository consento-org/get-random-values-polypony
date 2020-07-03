const { spawn } = require('child_process')

const exec = function (command, args, opts) {
  const spawned = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts
  })
  let buf = ''
  let trigger
  const handleData = data => {
    buf += data.toString()
    trigger && trigger()
  }
  spawned.stderr.on('data', handleData)
  spawned.stdout.on('data', handleData)
  spawned.on('exit', code => {
    proc.exit = code
    trigger && trigger()
  })

  const asyncIter = async function * (opts = {}) {
    while (proc.exit === null || buf.length > 0) {
      do {
        const index = buf.indexOf('\n')
        if (index === -1) {
          yield buf
          buf = ''
        } else {
          yield buf.substr(0, index)
          buf = buf.substr(index + 1)
        }
      } while (buf.length > 0)
      await new Promise(resolve => {
        trigger = resolve
      })
    }
    if (opts.noError !== true && proc.exit !== 0) {
      throw new Error(`Error: Command ended with exit code: ${proc.exit}`)
    }
  }

  const proc = {
    [Symbol.asyncIterator]: asyncIter,
    async promise () {
      const lines = []
      for await (const line of asyncIter({ noError: true })) {
        lines.push(line)
      }
      const data = lines.join('\n')
      if (proc.exit !== 0) {
        throw new Error(data)
      }
      return data
    },
    exit: null
  }
  return proc
}

const logExec = async function (command, args, opts) {
  for await (const line of exec(command, args, opts)) { console.log(line) }
}

module.exports = {
  exec, logExec
}
