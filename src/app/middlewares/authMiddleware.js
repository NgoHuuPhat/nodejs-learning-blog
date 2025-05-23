const jwt = require('jsonwebtoken')
const axios = require('axios')
const Role = require('../models/Role')
const Account = require('../models/Account')

module.exports = async function authMiddleware(req, res, next) {
    const token = req.cookies.accessToken

    // Khai báo biến decoded để lưu thông tin giải mã từ token
    let decoded = null

    if (!token) {
        if(req.originalUrl.startsWith('/admin')) {
            return res.redirect('/admin/auth/login')
        } else {
            return res.redirect('/user/login')
        }
    } else {
        try {
            // Xác thực token
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (err) {
            console.log('AccessToken hết hạn, thử làm mới')
            try {
                // Kiểm tra xem đường dẫn là admin hay user
                let refreshTokenUrl = req.originalUrl.startsWith('/admin') ? 'admin/auth/refresh-token' : 'user/refresh-token'

                //Nếu AccessToken hết hạn thì chuyển qua trang RefreshToken API
                const response = await axios.get(
                    `http://localhost:3000/${refreshTokenUrl}`,
                    {
                        headers: {
                            Cookie: `refreshToken=${req.cookies.refreshToken}`,
                        },
                        withCredentials: true,
                    },
                )

                // Cập nhật lại accessToken trong cookie
                res.cookie('accessToken', response.data.accessToken, {
                    httpOnly: true,
                })

                // Decode lại accessToken mới
                decoded = jwt.verify(
                    response.data.accessToken,
                    process.env.JWT_SECRET,
                )
            } catch (refreshErr) {
                console.log('Làm mới Access Token thất bại', refreshErr.message)
                if(req.originalUrl.startsWith('/admin')) {
                    return res.redirect('/admin/auth/login')
                } else {
                    return res.redirect('/user/login')
                }
            }
        }

        // Lấy giá trị Account mới nhất từ database
        const account = await Account.findOne({ _id: decoded.id }).lean()
        if (!account) {
            
            if(req.originalUrl.startsWith('/admin')) {
                return res.redirect('/admin/auth/login')
            } else {
                return res.redirect('/user/login')
            }
        }

        // Lấy giá trị từ Collection Role tương ứng với _id
        const role = await Role.findOne({ _id: decoded.role_id })

        // Gán vào res.locals để HBS có thể sử dụng
        res.locals.account = {
            ...decoded,

            //Ghi đè giá trị từ decoded bằng giá trị từ database
            fullName: account.fullName,
            avatar: account.avatar,
            email: account.email,

            role_name: role.name,
            role_permissions: role.permissions,
        }
        next()
    }
}
