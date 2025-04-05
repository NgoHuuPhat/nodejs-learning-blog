const newsRoute = require('./news')
const meRoute = require('./me')
const siteRoute = require('./site')
const courseRoute = require('./courses')
const userRoute = require('./user')

const authClientMiddleware = require('../../app/middlewares/authClient')

function route(app) {
    //Client
    app.use('/', userRoute)
    app.use('/news', authClientMiddleware, newsRoute)
    app.use('/me', authClientMiddleware, meRoute)
    app.use('/courses', authClientMiddleware, courseRoute)
    app.use('/home', authClientMiddleware, siteRoute)
}

module.exports = route
