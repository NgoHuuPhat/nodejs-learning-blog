const newsRoute = require('./news')
const meRoute = require('./me')
const siteRoute = require('./site')
const courseRoute = require('./courses')
const userRoute = require('./user')
const postRoute = require('./posts')
const notificationRoute = require('./notifications')

const authMiddleware = require('../../app/middlewares/authMiddleware')
const notificationsMiddleware = require('../../app/middlewares/notifications')

function route(app) {
    //Client
    app.use('/user', userRoute)
    app.use('/', authMiddleware, notificationsMiddleware, siteRoute)
    app.use('/news', authMiddleware, notificationsMiddleware, newsRoute)
    app.use('/me', authMiddleware, notificationsMiddleware, meRoute)
    app.use('/courses', authMiddleware, notificationsMiddleware, courseRoute)
    app.use('/posts', authMiddleware, notificationsMiddleware, postRoute)
    app.use('/notifications', authMiddleware, notificationsMiddleware, notificationRoute)
}

module.exports = route
