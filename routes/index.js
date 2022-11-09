const apiRouter = require('../routes/api')

module.exports = function(app) {
    app.use('/api', apiRouter)
}

