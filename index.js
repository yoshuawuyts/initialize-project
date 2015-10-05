const install = require('npm-install-package')
const copy = require('copy-template-dir')
const prompt = require('inquirer').prompt
const today = require('dates-of-today')
const assign = require('xtend/mutable')
const mapLimit = require('map-limit')
const gitInit = require('git-init')
const mkdirp = require('mkdirp')
const path = require('path')
const rc = require('rc')

module.exports = initializeProject

// Create a fresh project
// (obj, fn) -> null
function initializeProject (argv, cb) {
  argv.date = today()
  argv.devDependencies = [ 'bulk', 'dependency-check', 'garnish', 'istanbul',
    'linklocal', 'nodemon', 'npm-check-updates', 'standard', 'tape' ]

  const tasks = [ runPrompt, getUser, chdir, copyFiles, createGit, devDeps ]
  mapLimit(tasks, 1, iterator, cb)
  function iterator (fn, next) {
    fn(argv, next)
  }
}

// query user for values
// (obj, fn) -> null
function runPrompt (argv, cb) {
  // values exist, no need to prompt
  if (argv.name) return cb()

  const questions = [ { name: 'name', default: '', message: 'Project name' } ]
  prompt(questions, function (res) {
    assign(argv, res)
    cb()
  })
}

// get the current user if no user was specified
// (obj, fn) -> null
function getUser (argv, cb) {
  if (argv.user) return cb()

  const conf = rc('npm')
  if (!conf) return cb('no npm config found')

  const github = conf['init.author.github']
  if (!github) return cb('no init.author.github set')
  argv.user = github

  const name = conf['init.author.name']
  if (!name) return cb('no init.author.name set')
  argv.realName = name

  cb()
}

// change the output directory
// (obj, fn) -> null
function chdir (argv, cb) {
  const dir = path.join(argv.directory, argv.name)
  mkdirp(dir, function (err) {
    if (err) return cb(err)
    process.chdir(dir)
    cb()
  })
}

// copy files from dir to dist
// (obj, fn) -> null
function copyFiles (argv, cb) {
  const inDir = path.join(__dirname, 'templates')
  copy(inDir, process.cwd(), argv, cb)
}

// create git repository
// (obj, cb) -> null
function createGit (argv, next) {
  const path = argv.path
  gitInit(path, next)
}

// install dev dependencies from npm, pull from cache by default
// (obj, cb) -> null
function devDeps (argv, cb) {
  const opts = { saveDev: true, cache: true }
  install(argv.devDependencies, opts, cb)
}
