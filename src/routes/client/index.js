const newsRoute = require('./news')
const meRoute = require('./me')
const siteRoute = require('./site')
const courseRoute = require('./courses')
const userRoute = require('./user')
const postRoute = require('./posts')
const notificationRoute = require('./notifications')
const commentRoute = require('./comments')
const searchRoute = require('./search')
const learningRoute = require('./learning')
const paymentRoute = require('./payment')
const discountRoute = require('./discounts')

const authMiddleware = require('../../app/middlewares/authMiddleware')
const notificationsMiddleware = require('../../app/middlewares/notifications')

function route(app) {
    //Client
    app.use('/user', userRoute)
    app.use('/', authMiddleware, notificationsMiddleware, siteRoute)
    app.use('/news', authMiddleware, notificationsMiddleware, newsRoute)
    app.use('/me', authMiddleware, notificationsMiddleware, meRoute)
    app.use('/learning', authMiddleware, notificationsMiddleware, learningRoute)
    app.use('/courses', authMiddleware, notificationsMiddleware, courseRoute)
    app.use('/posts', authMiddleware, notificationsMiddleware, postRoute)
    app.use('/notifications', authMiddleware, notificationsMiddleware, notificationRoute)
    app.use('/comments', authMiddleware, notificationsMiddleware, commentRoute)
    app.use('/search', authMiddleware, notificationsMiddleware, searchRoute)
    app.use('/payment', authMiddleware, notificationsMiddleware, paymentRoute)
    app.use('/discounts', authMiddleware, notificationsMiddleware, discountRoute)
}

module.exports = route
