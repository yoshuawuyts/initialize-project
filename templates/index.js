const errorStream = require('http-error-stream')
const serverRouter = require('server-router')
const createError = require('server-error')
const serverSink = require('server-sink')
const stdout = require('stdout-stream')
const assert = require('assert')
const Config = require('envobj')
const http = require('http')
const Log = require('bole')

const log = Log('main')
const error = createError(log)

module.exports = main

if (!module.parent) {
  const config = Config({
    API_PORT: 1337,
    LOG_LEVEL: 'info',
    NODE_ENV: 'production'
  })

  main(config)
}

function main (config) {
  assert.equal(typeof config, 'object', 'config should be an object')
  assert.ok(config.LOG_LEVEL, 'config.LOG_LEVEL should exist')

  Log.output({ level: config.LOG_LEVEL, stream: stdout })
  logEnv(config, log.info)

  const router = createRouter(config)
  const apiService = createServer(config, router)

  // return services
  return {
    api: apiService
  }
}

function createServer (config, router) {
  assert.equal(typeof config, 'object', 'config should be an object')
  assert.ok(config.API_PORT, 'config.API_PORT should exist')
  assert.ok(config.LOG_LEVEL, 'config.LOG_LEVEL should exist')

  const server = http.createServer(function (req, res) {
    const sink = serverSink(req, res, log.info)
    router(req, res).pipe(sink)
  }).listen(config.API_PORT)

  const msg = { message: { type: 'http', port: config.API_PORT } }
  server.on('listening', log.info.bind(log, msg))
  return server
}

function createRouter (config, routers) {
  const router = serverRouter('/404')
  router.on('/404', createNotfoundHandler())
  return router
}

function createNotfoundHandler () {
  return function (req, res) {
    return errorStream(req, res, error.client({
      statusCode: 404,
      message: 'Path not found'
    }))
  }
}

function logEnv (env, log) {
  log({ message: env })
}
