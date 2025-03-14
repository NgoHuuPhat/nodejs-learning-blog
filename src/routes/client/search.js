var express = require('express')
var router = express.Router()
const SearchController = require('../../app/controllers/SearchController')

router.get('/', SearchController.search)

module.exports = router
