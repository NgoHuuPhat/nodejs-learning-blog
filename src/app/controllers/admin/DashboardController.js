class DashboardController {
    //[GET] /news
    index(req, res) {
        res.render('admin/layouts/main')
    }
}

module.exports = new DashboardController()
