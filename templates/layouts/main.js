const hyperx = require('hyperx')

module.exports = template

// main template layout
// null -> (obj, obj, obj) -> obj
function template () {
  return function (params, app, state) {
    const hx = hyperx(app.h)
    return hx`
      <section>hello world</section>
    `
  }
}
