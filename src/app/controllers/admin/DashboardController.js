class DashboardController {
    //[GET] /news
    index(req, res) {
        res.render('admin/dashboard', {account: req.account})  
    }
}

module.exports = new DashboardController()
