const dashboardRoute = require('./dashboard')
const roleRoute = require('./roles')
const accountRoute = require('./accounts')
const authRoute = require('./auth')
const courseRoute = require('./courses')
const myAccountRoute = require('./my-account')

const authAdminMiddleware = require('../../app/middlewares/authAdmin')
const authorMiddleware = require('../../app/middlewares/authorMiddleware')

function routeAdmin(app) {

    // Khai báo route
    app.use('/admin/auth', authRoute);
    app.use('/admin', authAdminMiddleware, authorMiddleware, dashboardRoute);
    app.use('/admin/roles',authAdminMiddleware, authorMiddleware, roleRoute);
    app.use('/admin/accounts', authAdminMiddleware,authorMiddleware,  accountRoute);
    app.use('/admin/courses', authAdminMiddleware, authorMiddleware, courseRoute);
    app.use('/admin/my-account', authAdminMiddleware, authorMiddleware, myAccountRoute);
    
}

module.exports = routeAdmin
