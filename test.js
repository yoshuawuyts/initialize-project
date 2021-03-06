const spawn = require('child_process').spawn
const concat = require('concat-stream')
const mapLimit = require('map-limit')
const readdirp = require('readdirp')
const rimraf = require('rimraf')
const path = require('path')
const test = require('tape')

test('should create files', function (t) {
  t.plan(11)

  const route = path.join(process.cwd(), 'tmp')
  const cmd = path.join(__dirname, 'bin/cli.js')
  const description = 'foobar'
  const name = 'test'

  const fns = [ runInit, verifyFiles, clean ]
  mapLimit(fns, 1, function (fn, cb) { fn(cb) }, function (err) {
    t.error(err)
  })

  function runInit (next) {
    const ps = spawn(cmd, [ '-d', route, '-n', name, '-D', description ])
    ps.stdout.pipe(process.stdout) // uncomment in case of bugs
    ps.stderr.pipe(process.stderr)
    ps.stdout.on('end', next)
  }

  function verifyFiles (next) {
    const opts = { root: path.join(route, name) }
    readdirp(opts).pipe(concat({ object: true }, sink))

    function sink (arr) {
      t.ok(Array.isArray(arr), 'is array')

      const files = [ '.gitignore', '.travis.yml', 'LICENSE', 'README.md',
        'index.js', 'package.json', 'test/index.js', 'client.js',
        'layouts/main.js' ]

      arr = arr.map(function (obj) { return obj.path })
      files.forEach(function verifyExists (name) {
        t.notEqual(arr.indexOf(name), -1, name + ' exists')
      })

      next()
    }
  }

  function clean (next) {
    rimraf(route, next)
  }
})
