const history = require('sheet-router/history')
const bridge = require('sheet-router/bridge')
const sheetRouter = require('sheet-router')
const createApp = require('virtual-app')
const vdom = require('virtual-dom')
const sf = require('sheetify')

// import local components
const layout = require('./client-layout')

// import CSS packages from node_modules
sf('css-wipe')

// define initial state
const initialState = { location: document.location.href }

// initialize and attach
const app = createApp(vdom)
const render = app.start(modifyState, initialState)
const router = createRouter()
const tree = bridge(render, function (state) {
  return router(state.location, app)
})

document.body.appendChild(tree)

// enable HTML history API and href click listeners
history(function (href) {
  app.store({ type: 'location', location: href })
})

// routing
function createRouter () {
  return sheetRouter('/404', function (r, t) {
    return [
      t('/', layout())
    ]
  })
}

// manage state changes
function modifyState (action, state) {
}
