class DashboardController {
    //[GET] /admin/dashboard
    index(req, res) {
        res.render('admin/dashboard')
    }
}

module.exports = new DashboardController()
