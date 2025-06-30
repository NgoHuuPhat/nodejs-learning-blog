var express = require('express')
var router = express.Router()
const meController = require('../../app/controllers/client/MeController')

router.get('/my-profile', meController.myProfileRoute)

module.exports = router
