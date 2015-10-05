const spawn = require('child_process').spawn
const concat = require('concat-stream')
const readdirp = require('readdirp')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const path = require('path')
const test = require('tape')

test('should create files', function (t) {
  t.plan(12)

  mkdirp('tmp', function (err, res) {
    t.error(err, 'no err')

    const route = path.join(process.cwd(), 'tmp')
    const cmd = path.join(__dirname, 'bin/cli.js')
    const name = 'test'
    const ps = spawn(cmd, [ '-d', route, '-n', name ])

    ps.stdout.pipe(process.stdout) // uncomment in case of bugs
    ps.stderr.pipe(process.stderr)
    ps.stdout.on('end', verify)

    function verify () {
      const opts = { root: route, directoryFilter: '!node_modules' }
      readdirp(opts).pipe(concat({ object: true }, concatFn))

      function concatFn (arr) {
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

        rimraf(path.join(process.cwd(), 'tmp'), function (err) {
          t.error(err, 'no err')
        })
      }
    }
  })
})
