const dashboardRoute = require('./dashboard')
const roleRoute = require('./roles')
const setAdminLayout = require('../../app/middlewares/setAdminLayout')

function routeAdmin(app) {

    app.use(setAdminLayout);

    //Admin
    app.use('/admin', dashboardRoute)
    app.use('/admin/roles', roleRoute)

}

module.exports = routeAdmin
