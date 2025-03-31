const dashboardRoute = require('./dashboard')
const roleRoute = require('./roles')
const accountRoute = require('./accounts')
const authRoute = require('./auth')
const courseRoute = require('./courses')
const myAccountRoute = require('./my-account')

const setAuthLayout = require('../../app/middlewares/setAuthLayout')
const setAdminLayout = require('../../app/middlewares/setAdminLayout')
const authMiddleware = require('../../app/middlewares/authMiddleware')
const authorMiddleware = require('../../app/middlewares/authorMiddleware')

function routeAdmin(app) {
    app.use(setAuthLayout);
    app.use(setAdminLayout);

    // Khai báo route
    app.use('/admin/auth', authRoute);
    app.use('/admin', authMiddleware, authorMiddleware, dashboardRoute);
    app.use('/admin/roles',authMiddleware, authorMiddleware, roleRoute);
    app.use('/admin/accounts', authMiddleware,authorMiddleware,  accountRoute);
    app.use('/admin/courses', authMiddleware, authorMiddleware, courseRoute);
    app.use('/admin/my-account', authMiddleware, authorMiddleware, myAccountRoute);
    
}

module.exports = routeAdmin
