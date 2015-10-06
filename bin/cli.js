#!/usr/bin/env node
const cliclopts = require('cliclopts')
const minimist = require('minimist')
const util = require('util')
const fs = require('fs')

const pkg = require('../package.json')
const main = require('../')

const opts = cliclopts([
  {
    name: 'help',
    abbr: 'h',
    boolean: true
  },
  {
    name: 'version',
    abbr: 'v',
    boolean: true
  },
  {
    name: 'directory',
    abbr: 'd',
    default: process.cwd()
  },
  {
    name: 'name',
    abbr: 'n',
    default: ''
  }
])

const argv = minimist(process.argv.slice(2), opts.options())

// parse options
if (argv.version) {
  const version = require('../package.json').version
  process.stdout.write('v' + version)
  process.exit(0)
} else if (argv.help) {
  process.stdout.write(pkg.name + ' - ' + pkg.description + '\n')
  usage(0)
} else {
  main(argv, function (err) {
    if (err) {
      process.stderr.write(util.format(err))
      process.stderr.write('\n')
    }
  })
}

// print usage & exit
// num? -> null
function usage (exitCode) {
  fs.createReadStream(__dirname + '/usage.txt')
    .pipe(process.stdout)
    .on('close', process.exit.bind(null, exitCode))
}
