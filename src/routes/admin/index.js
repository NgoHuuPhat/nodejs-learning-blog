const dashboardRoute = require('./dashboard')

function routeAdmin(app) {

    //Admin
    app.use('/admin', dashboardRoute)

}

module.exports = routeAdmin
