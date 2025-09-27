const jwt = require('jsonwebtoken')
const axios = require('axios')
const Role = require('../models/Role')
const Account = require('../models/Account')

module.exports = async function authMiddleware(req, res, next) {
    let decoded = null
    const { accessToken, refreshToken } = req.cookies

    const isAdmin = req.originalUrl.startsWith('/admin')
    const loginUrl = isAdmin ? '/admin/auth/login' : '/user/login'
    const refreshTokenUrl = isAdmin ? 'admin/auth/refresh-token' : 'user/refresh-token'

    try {
        if (accessToken) {
            decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
        } else if (refreshToken) {
            const response = await axios.get(`http://localhost:3000/${refreshTokenUrl}`, {
                headers: { Cookie: `refreshToken=${refreshToken}` },
                withCredentials: true,
            })
            res.cookie('accessToken', response.data.accessToken, { 
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 15 * 60 * 1000,
             })
            decoded = jwt.verify(response.data.accessToken, process.env.JWT_SECRET)
        } else {
            return res.redirect(loginUrl)
        }

        const account = await Account.findOne({ _id: decoded.id }).lean()
        if (!account) return res.redirect(loginUrl)

        const role = await Role.findOne({ _id: decoded.role_id })

        res.locals.account = {
            ...decoded,
            fullName: account.fullName,
            avatar: account.avatar,
            email: account.email,
            role_name: role?.name,
            role_permissions: role?.permissions,
        }

        next()
    } catch (err) {
        console.log('Lỗi xác thực hoặc refresh token:', err.message)
        return res.redirect(loginUrl)
    }
}
