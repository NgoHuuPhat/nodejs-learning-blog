var express = require('express')
var router = express.Router()
const UserController = require('../../app/controllers/client/UserController')

router.get('/register', UserController.showRegisterForm)
router.post('/register', UserController.registerPost)
router.get('/login', UserController.showLoginForm)
router.post('/login', UserController.loginPost)
router.get('/logout', UserController.logout)
router.get('/refresh-token', UserController.refreshToken)
router.get('/forgot-password', UserController.showforgotPasswordForm)
router.post('/forgot-password', UserController.forgotPasswordPost)
router.get('/verify-otp', UserController.showVerifyForm)
router.post('/verify-otp', UserController.verifyOTPPost)
router.get('/reset-password', UserController.showResetPasswordrForm)
router.post('/reset-password', UserController.resetPasswordrPost)

module.exports = router
