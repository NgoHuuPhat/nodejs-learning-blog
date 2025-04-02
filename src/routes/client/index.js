const newsRoute = require('./news')
const meRoute = require('./me')
const siteRoute = require('./site')
const courseRoute = require('./courses')
const authRoute = require('./auth')

function route(app) {

    //Client 
    app.use('/news', newsRoute)
    app.use('/me', meRoute)
    app.use('/courses', courseRoute)
    app.use('/', siteRoute)
    app.use('/auth', authRoute)

}

module.exports = route
