var express = require('express')
var router = express.Router()
const DashboardController = require('../../app/controllers/admin/DashboardController')

router.get('/', DashboardController.index)

module.exports = router
