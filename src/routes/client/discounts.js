var express = require('express')
var router = express.Router()
const discountController = require('../../app/controllers/client/DiscountController')

router.get('/', discountController.index)

module.exports = router

