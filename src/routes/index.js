const newsRoute = require('./news')
const meRoute = require('./me')
const siteRoute = require('./site')
const courseRoute = require('./courses')
const searchRoute = require('./search')

function route(app) {
    app.use('/news', newsRoute)
    app.use('/me', meRoute)
    app.use('/courses', courseRoute)
    app.use('/search', searchRoute)

    app.use('/', siteRoute)

}

module.exports = route
