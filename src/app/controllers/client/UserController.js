const Account = require('../../models/Account')
const ForgotPassword = require('../../models/ForgotPassword')
const Role = require('../../models/Role')
var jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const sendMailHelper = require('../../../services/sendMail')
const passport = require('passport')

class UserController {
    //[GET] /register
    showRegisterForm(req, res) {
        res.render('client/user/register')
    }

    //[POST] /register
    async registerPost(req, res, next) {
        try {
            //Mặc định là role user
            const role = await Role.findOne({ name: 'user' }).lean()

            if (role) {
                req.body.role_id = role._id
            }

            // Kiểm tra xem email đã tồn tại chưa
            const emailExists = await Account.findOne({ email: req.body.email })
            if (emailExists) {
                req.flash('error', 'Email đã tồn tại!')
                return res.redirect('back')
            }

            //Mã hóa password
            const hashedPassword = await bcrypt.hash(req.body.password, 10)

            const newAccount = {
                fullName: req.body.fullName,
                email: req.body.email,
                password: hashedPassword,
                role_id: req.body.role_id,
                status: 'active',
            }

            //Lưu vào database (có thể dùng .save())
            await Account.create(newAccount)
            req.flash('success', 'Đăng ký thành công!')
            res.redirect('/user/login')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /login
    showLoginForm(req, res) {
        //Kiểm tra đã có Token thì không đăng nhập lại
        if (req.cookies.accessToken) {
            res.redirect('/')
        } else {
            res.render('client/user/login')
        }
    }

    //[POST] /login
    async loginPost(req, res, next) {
        try {
            const { email, password } = req.body
            const checkEmail = await Account.findOne({ email: email }).lean()

            // Check hoạt động
            if (checkEmail.status == 'inactive') {
                req.flash('error', `Tài khoản đã bị khóa!`)
                req.flash('email', email) // Lưu email đã nhập
                return res.redirect('back')
            }

            // Check Email
            if (!checkEmail) {
                req.flash('error', `Email không tồn tại!`)
                req.flash('email', email) // Lưu email đã nhập
                return res.redirect('back')
            }

            // Check password
            const match = await bcrypt.compare(password, checkEmail.password)
            if (!match) {
                req.flash('error', `Sai mật khẩu!`)
                req.flash('email', email) // Lưu email đã nhập
                return res.redirect('back')
            }

            // Create Access Token (Lưu ý không truyền password ...)
            const payload = {
                id: checkEmail._id,
                email: checkEmail.email,
                fullName: checkEmail.fullName,
                avatar: checkEmail.avatar,
                role_id: checkEmail.role_id,
            }

            //rememberMe = true/false
            const rememberMe = req.body.rememberMe === 'on' ? true : false

            // Create accessToken - refreshToken
            const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            })
            const refreshToken = jwt.sign(
                payload,
                process.env.JWT_REFRESH_SECRET,
                {
                    expiresIn: rememberMe
                        ? '30d'
                        : process.env.JWT_REFRESH_EXPIRE,
                },
            )

            // Lưu accessToken - refreshToken vào cookie
            res.cookie('accessToken', accessToken, { httpOnly: true })
            res.cookie('refreshToken', refreshToken, { httpOnly: true })

            res.redirect('/')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /logout
    logout(req, res) {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        res.redirect('/user/login')
    }

    //[GET] /refresh-token
    async refreshToken(req, res, next) {
        const token = req.cookies.refreshToken
        if (!token) {
            return res.redirect('/user/login')
        }
        try {
            // Kiểm tra refreshToken
            const decode = jwt.verify(token, process.env.JWT_REFRESH_SECRET)

            // Create Access Token (Lưu ý không truyền password ...)
            const payload = {
                id: decode.id,
                email: decode.email,
                fullName: decode.fullName,
                avatar: decode.avatar,
                role_id: decode.role_id,
            }

            // Tạo mới AccessToken
            const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            })

            // Trả về JSON chứa accessToken mới cho middleware sử dụng
            res.json({ accessToken: newAccessToken })
        } catch (error) {
            console.log('refreshToken không hợp lệ')
            res.redirect('/user/login')
            next(error)
        }
    }

    //[GET] /forgot-password
    showforgotPasswordForm(req, res) {
        res.render('client/user/forgot-password')
    }

    //[POST] /forgot-password
    async forgotPasswordPost(req, res, next) {
        try {
            const { email } = req.body

            // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
            const account = await Account.findOne({ email }).lean()
            if (!account) {
                req.flash('error', 'Email không tồn tại!')
                return res.redirect('back')
            }

            // Tạo OTP ngẫu nhiên lưu vào database
            const otp = Math.floor(100000 + Math.random() * 900000) // Tạo OTP 6 chữ số
            const forgotPassword = {
                email,
                otp,
                expireAt: Date.now(),
            }
            await ForgotPassword.create(forgotPassword)

            // Gửi email chứa OTP cho người dùng
            const subject = 'Xác thực OTP lấy lại mật khẩu'
            const html = `Mã OTP của bạn là: <h1>${otp}</h1>Thời gian hiệu lực là 3 phút.`
            sendMailHelper.sendMail(email, subject, html)

            // Chuyển hướng đến trang xác thực OTP
            res.redirect(`/user/verify-otp?email=${email}`)
        } catch (error) {
            next(error)
        }
    }

    //[GET] /verify-otp
    showVerifyForm(req, res) {
        res.locals.layout = 'auth'
        res.render('client/user/verify-otp', { email: req.query.email })
    }

    //[POST] /verify-otp
    async verifyOTPPost(req, res, next) {
        try {
            const { email, otp } = req.body

            // Kiểm tra result
            const result = await ForgotPassword.findOne({ email, otp }).lean()

            if (!result) {
                req.flash('error', 'OTP không hợp lệ!')
                return res.redirect('back')
            }

            // Tạo token mới cho người dùng
            const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRE,
            })
            res.cookie('resetToken', resetToken, { httpOnly: true })

            // Chuyển hướng đến trang đặt lại mật khẩu
            res.redirect('/user/reset-password')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /reset-password
    showResetPasswordrForm(req, res) {
        res.locals.layout = 'auth'
        res.render('client/user/reset-password')
    }

    //[POST] /reset-password
    async resetPasswordrPost(req, res, next) {
        try {
            // Kiểm tra token lấy giá trị email
            const decode = jwt.verify(
                req.cookies.resetToken,
                process.env.JWT_SECRET,
                (err, decode) => {
                    if (err) {
                        req.flash(
                            'error',
                            'Token đã hết hạn. Vui lòng yêu cầu lại mã OTP.',
                        )
                        return res.redirect('back')
                    }
                    return decode
                },
            )
            const email = decode.email

            // Mã hóa password mới
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            req.body.password = hashedPassword

            // Cập nhật mật khẩu mới vào cơ sở dữ liệu
            await Account.updateOne({ email }, { password: req.body.password })

            res.clearCookie('resetToken')
            res.redirect('/user/login')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /google
    googleLogin(req, res, next) {
        return passport.authenticate('google', {scope: ['profile', 'email'],})(req, res, next)
    }

    // [GET] /google/callback
    googleCallback(req, res, next) {
        passport.authenticate('google', { failureRedirect: '/user/login' }, (err, user, info) => {
            if (err || !user) {
                req.flash('error', info.message || 'Đăng nhập bằng Google thất bại!')
                return res.redirect('/user/login')
            }

            req.logIn(user, (err) => {
                if (err) return next(err)

                // Create Access Token (Lưu ý không truyền password ...)
                const payload = {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar,
                    role_id: user.role_id,
                }

                // Tạo accessToken - refreshToken
                const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRE,
                })
                const refreshToken = jwt.sign(
                    payload,
                    process.env.JWT_REFRESH_SECRET,
                    {
                        expiresIn: process.env.JWT_REFRESH_EXPIRE,
                    },
                )

                // Lưu accessToken - refreshToken vào cookie
                res.cookie('accessToken', accessToken, { httpOnly: true })
                res.cookie('refreshToken', refreshToken, { httpOnly: true })

                return res.redirect('/') 
            })
        })(req, res, next) 
    }

}

module.exports = new UserController()
