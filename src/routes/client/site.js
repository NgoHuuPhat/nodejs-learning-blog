var express = require('express')
var router = express.Router()
const siteController = require('../../app/controllers/client/SiteController')

router.get('/', siteController.home)

module.exports = router
