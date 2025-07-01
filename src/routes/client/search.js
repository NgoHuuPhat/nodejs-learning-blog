var express = require('express')
var router = express.Router()
const searchController = require('../../app/controllers/client/SearchController')

router.get('/', searchController.search)

module.exports = router
