const dashboardRoute = require('./dashboard')
const roleRoute = require('./roles')
const accountRoute = require('./accounts')
const setAdminLayout = require('../../app/middlewares/setAdminLayout')

function routeAdmin(app) {

    app.use(setAdminLayout);

    //Admin
    app.use('/admin', dashboardRoute)
    app.use('/admin/roles', roleRoute)
    app.use('/admin/accounts', accountRoute)

}

module.exports = routeAdmin
