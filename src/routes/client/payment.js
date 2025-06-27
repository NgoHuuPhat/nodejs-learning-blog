var express = require('express')
var router = express.Router()
const paymentController = require('../../app/controllers/client/PaymentController')

router.post('/:id', paymentController.paymentDetails)
router.get('/vnpay-return', paymentController.vnpayReturn)

module.exports = router
