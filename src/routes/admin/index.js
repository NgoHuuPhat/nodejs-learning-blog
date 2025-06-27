const dashboardRoute = require('./dashboard')
const roleRoute = require('./roles')
const accountRoute = require('./accounts')
const authRoute = require('./auth')
const courseRoute = require('./courses')
const myAccountRoute = require('./my-account')
const postRoute = require('./posts')
const commentRoute = require('./comments')
const discountRoute = require('./discounts')

const authMiddleware = require('../../app/middlewares/authMiddleware')
const authorMiddleware = require('../../app/middlewares/authorMiddleware')

function routeAdmin(app) {
    // Khai báo route
    app.use('/admin/auth', authRoute)
    app.use('/admin', authMiddleware, authorMiddleware, dashboardRoute)
    app.use('/admin/roles', authMiddleware, authorMiddleware, roleRoute)
    app.use('/admin/accounts', authMiddleware, authorMiddleware, accountRoute)
    app.use('/admin/courses', authMiddleware, authorMiddleware, courseRoute)
    app.use('/admin/posts', authMiddleware, authorMiddleware, postRoute)
    app.use('/admin/my-account', authMiddleware, authorMiddleware, myAccountRoute)
    app.use('/admin/comments', authMiddleware, authorMiddleware, commentRoute)
    app.use('/admin/discounts', authMiddleware, authorMiddleware, discountRoute)
    
}

module.exports = routeAdmin
