const serverRouter = require('server-router')
const fromString = require('from2-string')
const browserify = require('browserify')
const bankai = require('bankai')
const path = require('path')

module.exports = registerRoutes

// register routes on the router
// null -> null
function registerRoutes () {
  const router = serverRouter('/404')

  router.on('/404', function (req, res) {
    res.statusCode = 404
    return fromString('404 not found')
  })

  // html
  const html = bankai.html()
  router.on('/', html)

  // css
  const css = bankai.css({
    use: [[ 'sheetify-cssnext', { sourcemap: false } ]]
  })
  router.on('/bundle.css', css)

  // js
  const js = bankai.js(browserify, path.join(__dirname, 'client-main.js'))
  router.on('/bundle.js', js)

  return router
}
