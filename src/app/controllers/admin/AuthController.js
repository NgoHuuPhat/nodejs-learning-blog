const Account = require('../../models/Account')
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

class AuthController {

    //[GET] /admin/auth/login
    index(req, res) {

        //Kiểm tra đã có Token thì không đăng nhập lại
        if(req.cookies.accessToken){
            res.redirect('/admin/dashboard')
        } else{
            res.render('admin/auth/login')
        }
    }

    //[POST] /admin/auth/login
    async login(req, res, next) {
        try {
            const {email,password} = req.body
            const checkEmail = await Account.findOne({email: email}).lean()
            
            // Check hoạt động
            if(checkEmail.status == 'inactive'){
                req.flash('error', `Tài khoản đã bị khóa!`);
                req.flash('email', email); // Lưu email đã nhập
                return res.redirect('back'); 
            }
            
            // Check Email 
            if(!checkEmail){
                req.flash('error', `Email không tồn tại!`);
                req.flash('email', email); // Lưu email đã nhập
                return res.redirect('back'); 
            } 

            // Check password
            const match = await bcrypt.compare(password, checkEmail.password)
            if(!match){
                req.flash('error', `Sai mật khẩu!`);
                req.flash('email', email); // Lưu email đã nhập
                return res.redirect('back'); 
            }

            // Create Access Token (Lưu ý không truyền password ...)
            const payload = {
                id: checkEmail._id,
                email: checkEmail.email,
                fullName: checkEmail.fullName,
                avatar: checkEmail.avatar,
                role_id: checkEmail.role_id
            }

            // Create accessToken - refreshToken
            const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRE})

            // Lưu accessToken - refreshToken vào cookie
            res.cookie('accessToken', accessToken, { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });

            res.redirect('/admin/dashboard')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/auth/logout
    logout(req,res){
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        res.redirect('/admin/auth/login')
    }

    //[GET] /admin/auth/refresh-token
    async refreshToken(req, res, next) {

        const token = req.cookies.refreshToken
        if(!token){
            return res.redirect('/admin/auth/login'); 
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
                role_id: decode.role_id
            }

            // Tạo mới AccessToken
            const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})

            // Trả về JSON chứa accessToken mới cho middleware sử dụng
            res.json({ accessToken: newAccessToken });

        } catch (error) {
            console.log('refreshToken không hợp lệ')
            res.redirect('/admin/auth/login');
            next(error);
        }
    }
}

module.exports = new AuthController()
