const indexRouter = require('../routes/index')
const apiRouter = require('../routes/api')

module.exports = function(app) {
    app.use('/', indexRouter)
    app.use('/api', apiRouter)
}
