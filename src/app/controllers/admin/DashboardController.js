class DashboardController {
    //[GET] /news
    index(req, res) {
        res.render('admin/dashboard')  
    }
}

module.exports = new DashboardController()
