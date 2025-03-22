const jwt = require('jsonwebtoken');
const axios = require('axios')

module.exports = async function authMiddleware(req, res, next){
    
    const token = req.cookies.accessToken
    if(!token){
        return res.redirect('/admin/auth/login')
    } else{
        try {
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // Gán vào res.locals để HBS có thể sử dụng
            res.locals.account = decoded
            next()

        } catch (err){

            console.log('AccessToken hết hạn, thử làm mới')
            try{
                //Nếu AccessToken hết hạn thì chuyển qua trang RefreshToken API
                const response = await axios.get('http://localhost:3000/admin/auth/refresh-token', {
                    headers: { Cookie: `refreshToken=${req.cookies.refreshToken}`},
                    withCredentials: true
                })

                // Cập nhật lại accessToken trong cookie
                res.cookie('accessToken', response.data.accessToken, { httpOnly: true });
                next()
            } catch(refreshErr){
                console.log('Làm mới Access Token thất bại', refreshErr.message)
                return res.redirect('/admin/auth/login')
            }

        }
    }
}