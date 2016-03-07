const history = require('sheet-router/history')
const bridge = require('sheet-router/bridge')
const sheetRouter = require('sheet-router')
const createApp = require('virtual-app')
const vdom = require('virtual-dom')
const sf = require('sheetify')

const layout = require('./layouts/main')

sf('css-wipe')

const app = createApp(vdom)
const initialState = { location: document.location.href }
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

function createRouter () {
  return sheetRouter('/404', function (r, t) {
    return [
      t('/', layout())
    ]
  })
}

function modifyState (action, state) {
}
