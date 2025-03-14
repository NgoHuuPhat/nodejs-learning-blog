var express = require('express')
var router = express.Router()
const siteController = require('../../app/controllers/client/SiteController')

router.get('/', siteController.home)
router.get('/search', siteController.search)

module.exports = router
