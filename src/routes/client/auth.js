var express = require('express')
var router = express.Router()
const AuthController = require('../../app/controllers/client/AuthController')

router.get('/register', AuthController.showRegisterForm)
router.post('/register', AuthController.registerPost)
// router.post('/login', AuthController.loginPost)
// router.get('/logout', AuthController.logout)
// router.get('/refresh-token', AuthController.refreshToken)

module.exports = router
