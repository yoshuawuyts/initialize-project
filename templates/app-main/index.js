const boleStream = require('bole-stream')
const httpNdjson = require('http-ndjson')
const summary = require('server-summary')
const json = require('JSONStream')
const http = require('http')

module.exports = createServer

function createServer (argv) {
  const port = argv.port
  const server = http.createServer((req, res) => {
    httpNdjson(req, res)
      .pipe(json.parse())
      .pipe(boleStream({ level: 'info' }))
    res.end('hello world')
  })

  server.listen(port, summary(server))
}
