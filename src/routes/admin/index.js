const dashboardRoute = require('./dashboard')
const setAdminLayout = require('../../app/middlewares/setAdminLayout')

function routeAdmin(app) {

    app.use(setAdminLayout);

    //Admin
    app.use('/admin', dashboardRoute)

}

module.exports = routeAdmin
