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

    //[POST] /admin/roles/store
    async store(req, res, next) {
        try {
            await Role.create(req.body);
            res.redirect('/admin/roles');
        } catch (error) {
            if (error.code === 11000) { // Mã lỗi 11000 là lỗi unique
                return res.render('admin/roles/create', { 
                    error: 'Tên nhóm quyền đã tồn tại!', 
                    role: req.body 
                });
            }
            next(error);
            
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
                email: checkEmail.email,
                fullName: checkEmail.fullName,
                avatar: checkEmail.avatar
            }
            console.log("Payload:", payload);
            const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE})

            // Lưu accessToken vào cookie
            res.cookie('accessToken', accessToken, { httpOnly: true });
            res.redirect('/admin/dashboard')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/auth/logout
    logout(req,res){
        res.clearCookie('accessToken')
        res.redirect('/admin/auth/login')
    }
    
}

module.exports = new AuthController()
