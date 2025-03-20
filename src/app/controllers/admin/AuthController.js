const Account = require('../../models/Account')
const bcrypt = require('bcrypt');

class AuthController {
    //[GET] /admin/auth/login
    index(req, res) {
        res.render('admin/auth/login')
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
            
            // Check Email 
            if(!checkEmail){
                req.flash('error', `Email đã tồn tại!`);
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
            
            // Check hoạt động
            if(checkEmail == 'inactive'){
                req.flash('error', `Tài khoản đã bị khóa!`);
                req.flash('email', email); // Lưu email đã nhập
                return res.redirect('back'); 
            }

            res.redirect('/admin/dashboard')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AuthController()
