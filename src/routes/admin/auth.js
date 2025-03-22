var express = require('express')
var router = express.Router()
const AuthController = require('../../app/controllers/admin/AuthController')

router.get('/login', AuthController.index)
router.post('/login', AuthController.login)
router.get('/logout', AuthController.logout)
router.get('/refresh-token', AuthController.refreshToken)

module.exports = router
