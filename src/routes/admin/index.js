const dashboardRoute = require('./dashboard')
const roleRoute = require('./roles')
const accountRoute = require('./accounts')
const authRoute = require('./auth')
const courseRoute = require('./courses')
const myAccountRoute = require('./my-account')

const setAuthLayout = require('../../app/middlewares/setAuthLayout')
const setAdminLayout = require('../../app/middlewares/setAdminLayout')
const authMiddleware = require('../../app/middlewares/authMiddleware')

function routeAdmin(app) {
    app.use(setAuthLayout);
    app.use(setAdminLayout);

    // Khai báo route
    app.use('/admin/auth', authRoute);
    app.use('/admin', authMiddleware, dashboardRoute);
    app.use('/admin/roles',authMiddleware, roleRoute);
    app.use('/admin/accounts', authMiddleware, accountRoute);
    app.use('/admin/courses', authMiddleware, courseRoute);
    app.use('/admin/my-account', authMiddleware, myAccountRoute);
    
}

module.exports = routeAdmin
