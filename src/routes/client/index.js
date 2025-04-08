const newsRoute = require('./news')
const meRoute = require('./me')
const siteRoute = require('./site')
const courseRoute = require('./courses')
const userRoute = require('./user')
const postRoute = require('./posts')

const authMiddleware = require('../../app/middlewares/authMiddleware')

function route(app) {
    //Client
    app.use('/', userRoute)
    app.use('/news', authMiddleware, newsRoute)
    app.use('/me', authMiddleware, meRoute)
    app.use('/courses', authMiddleware, courseRoute)
    app.use('/posts', authMiddleware, postRoute)
    app.use('/home', authMiddleware, siteRoute)
}

module.exports = route
