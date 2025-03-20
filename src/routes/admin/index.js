const dashboardRoute = require('./dashboard')
const roleRoute = require('./roles')
const accountRoute = require('./accounts')
const authRoute = require('./auth')
const setAuthLayout = require('../../app/middlewares/setAuthLayout')
const setAdminLayout = require('../../app/middlewares/setAdminLayout')

function routeAdmin(app) {
    app.use(setAuthLayout);
    app.use(setAdminLayout);

    // Khai báo route
    app.use('/admin/auth', authRoute);
    app.use('/admin', dashboardRoute);
    app.use('/admin/roles', roleRoute);
    app.use('/admin/accounts', accountRoute);
}

module.exports = routeAdmin
