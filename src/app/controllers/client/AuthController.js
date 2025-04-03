const Account = require('../../models/Account')
const Role = require('../../models/Role')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {

    //[GET] /register
    showRegisterForm(req, res) {    
        res.render('client/user/register')
    }

    //[POST] /register
    async registerPost(req, res, next) {
        try {
            //Mặc định là role user 
            const role = await Role.findOne({name: 'user'}).lean()

            if(role){
                req.body.role_id = role._id
            }

            // Kiểm tra xem email đã tồn tại chưa
            const emailExists = await Account.findOne({ email: req.body.email });
            if (emailExists) {
                req.flash('error', 'Email đã tồn tại!');
                return res.redirect('back'); 
            }

            //Mã hóa password
            const hashedPassword  = await bcrypt.hash(req.body.password, 10);

            const newAccount = {
                fullName: req.body.fullName,
                email: req.body.email,
                password: hashedPassword,
                role_id: req.body.role_id,
                status: 'active',
            };

            //Lưu vào database (có thể dùng .save())
            await Account.create(newAccount)
            req.flash('success', 'Đăng ký thành công!')
            res.redirect('/login');
        } catch (error) {
            next(error)
        }
    }

    //[GET] /login
    showLoginForm(req, res) {    
        res.render('client/user/login')
    }

    //[POST] /login
    async loginPost(req, res, next) {
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

            //rememberMe = true/false
            const rememberMe = req.body.rememberMe === 'on' ? true : false

            // Create accessToken - refreshToken
            const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: rememberMe ? '30d': process.env.JWT_REFRESH_EXPIRE})

            // Lưu accessToken - refreshToken vào cookie
            res.cookie('accessToken', accessToken, { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });

            res.redirect('/home')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /logout
    logout(req,res){
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        res.redirect('/login')
    }

    //[GET] /refresh-token
    async refreshToken(req, res, next) {

        const token = req.cookies.refreshToken
        if(!token){
            return res.redirect('/login'); 
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
            res.redirect('/login');
            next(error);
        }
    }

}

module.exports = new AuthController()
