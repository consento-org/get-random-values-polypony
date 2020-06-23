const browserify = require('browserify')
const upload = require('@leichtgewicht/quickhost')

module.exports = async prepareBuilder => {
  const { Builder, until, By } = require('selenium-webdriver')
  const TIMEOUT = 250000
  const quickhost = {
    server: process.env.QUICKHOST_SERVER,
    secret: process.env.QUICKHOST_SECRET,
    timeout: TIMEOUT
  }

  if (!quickhost.server) {
    throw new Error('process.env.QUICKHOST_SERVER is not specified.')
  }
  if (!quickhost.secret) {
    throw new Error('process.env.QUICKHOST_SECRET is not specified.')
  }

  const jsData = await runBrowserify([`${__dirname}/selenium-suite.js`])
  console.log('## Uploading js to quickhost')
  const jsKey = await upload({ ...quickhost, data: jsData, contentType: 'application/javascript' })
  console.log('## Uploading page to quickhost')
  const key = await upload({
    ...quickhost,
    data: `<html>
      <head>
        <meta charset="utf-8"/>
        <title>initing tests...</title>
      </head>
      <body>
        <textarea id="output" style="font-family: 'Courier New', Courier, monospace; padding: 5px" resizable=false></textarea>
      </body>
      <style type="text/css">
        body, html, textarea {
          padding: 0;
          margin: 0;
          border: 0;
          width: 100%;
          height: 100%;
          position: absolute;
        }
      </style>
      <script type="text/javascript">
        window.addEventListener('error', function(e) { 
          console.log('!!')
          element.value += '\\n' + (err.stack || err)
          document.title = 'failed: true'
        }, false);
      </script>
      <script src="${quickhost.server}/${jsKey}" type="text/javascript"></script>
    </html>`
  })
  const uri = `${quickhost.server}/${key}`
  console.log(`## Uploaded to quickhost: ${uri}`)
  const builder = new Builder()
  prepareBuilder(builder)
  const driver = builder.build()
  const readInput = (timeout) =>
    driver.executeScript(`
      var output
      if (document) {
        var outputElem = document.getElementById('output')
        if (outputElem && outputElem.value !== '' && outputElem.value !== null) {
          output = outputElem.value
          outputElem.value = ''
        }
      }
      return { output: output, title: document.title }
    `).then(({ output, title }) => {
      if (output !== undefined && output !== null) {
        timeout = Date.now() + TIMEOUT
        console.log(output)
      }
      const done = /^failed:\s*(true|false)/.exec(title)
      if (done) {
        return done[1] === 'true'
      }
      if (Date.now() > timeout) {
        return Promise.reject(new Error('timeout'))
      }
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(readInput(timeout))
        }, 10)
      })
    })
  try {
    console.log('## Starting Selenium')
    await driver
    console.log(`## Loading tests from ${uri}`)
    await driver.get(uri)
    await driver.wait(until.elementLocated(By.id('output')))
    return await readInput(Date.now() + TIMEOUT)
  } catch (err) {
    console.error(err)
  } finally {
    await driver.quit()
  }
}

function runBrowserify (files) {
  return new Promise((resolve, reject) => {
    console.log(`## Browserifying started. ${files.join(', ')}`)
    const result = []
    const opts = {
      debug: true,
      transform: [require('sourceify')]
    }
    const process = browserify(opts)
    for (const file of files) {
      process.add(file)
    }
    process.bundle()
      .once('error', reject)
      .on('data', data => result.push(data))
      .once('end', () => {
        const data = Buffer.concat(result)
        console.log('## Browserifying done. ' + data.byteLength)
        resolve(data)
      })
  })
}
