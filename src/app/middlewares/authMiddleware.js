const jwt = require('jsonwebtoken');

module.exports = function authMiddleware(req, res, next){
    const token = req.cookies.accessToken
    if(!token){
        return res.redirect('/admin/auth/login')
    } else{
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Gán thông tin account vào request để controller lấy
            req.account = decoded

            // Gán vào res.locals để HBS có thể sử dụng
            res.locals.account = decoded
            next()
        } catch (err){
            console.log('Lỗi xác thực JWT:', err.message);
            return res.redirect('/admin/auth/login')
        }
    }
}