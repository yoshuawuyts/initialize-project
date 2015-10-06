const spawn = require('child_process').spawn
const parse = require('safe-json-parse')
const concat = require('concat-stream')
const mapLimit = require('map-limit')
const readdirp = require('readdirp')
const rimraf = require('rimraf')
const pump = require('pump')
const path = require('path')
const test = require('tape')
const fs = require('fs')

test('should create files', function (t) {
  t.plan(16)

  const route = path.join(process.cwd(), 'tmp')
  const cmd = path.join(__dirname, 'bin/cli.js')
  const name = 'test'

  const fns = [ runInit, verifyFiles, verifyPkg, clean ]
  mapLimit(fns, 1, function (fn, cb) { fn(cb) }, function (err) {
    t.error(err)
  })

  function runInit (next) {
    const ps = spawn(cmd, [ '-d', route, '-n', name ])
    ps.stdout.pipe(process.stdout) // uncomment in case of bugs
    ps.stderr.pipe(process.stderr)
    ps.stdout.on('end', next)
  }

  function verifyFiles (next) {
    const opts = { root: path.join(route, name) }
    readdirp(opts).pipe(concat({ object: true }, sink))

    function sink (arr) {
      t.ok(Array.isArray(arr), 'is array')

      arr = arr.map(function (obj) { return obj.path })
      t.notEqual(arr.indexOf('.gitignore'), -1, '.gitignore exists')
      t.notEqual(arr.indexOf('.travis.yml'), -1, '.travis.yml exists')
      t.notEqual(arr.indexOf('LICENSE'), -1, 'LICENSE exists')
      t.notEqual(arr.indexOf('README.md'), -1, 'README.md exists')
      t.notEqual(arr.indexOf('index.js'), -1, 'index.js exists')
      t.notEqual(arr.indexOf('package.json'), -1, 'package.json exists')
      t.notEqual(arr.indexOf('test.js'), -1, 'test.js exists')
      t.notEqual(arr.indexOf('app-main/index.js'), -1, 'am/index.js exists')
      t.notEqual(arr.indexOf('app-main/package.json'), -1, 'am/package.json exists')

      next()
    }
  }

  function verifyPkg (next) {
    const loc = path.join(route, name, 'app-main', 'package.json')
    const rs = fs.createReadStream(loc)
    const ws = concat(sink)

    pump(rs, ws, function (err) {
      t.error(err)
    })

    function sink (buf) {
      const str = String(buf)
      parse(str, function (err, obj) {
        t.error(err)
        t.ok(obj.dependencies['bole-stream'], 'bole-stream exists')
        t.ok(obj.dependencies['http-ndjson'], 'http-ndjson')
        t.ok(obj.dependencies['server-summary'], 'server-summary')
        t.ok(obj.dependencies['JSONStream'], 'JSONStream')
      })
    }
  }

  function clean (next) {
    rimraf(route, next)
  }
})
