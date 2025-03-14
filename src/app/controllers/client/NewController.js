class NewController {
    //[GET] /news
    index(req, res) {
        res.render('client/news')
    }

    //[GET] /news/:slug
    show(req, res) {
        res.send('NEW DETAILS')
    }
}

module.exports = new NewController()
