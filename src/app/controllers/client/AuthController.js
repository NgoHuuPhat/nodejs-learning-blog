const Account = require('../../models/Account')
const Role = require('../../models/Role')
var jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class AuthController {

    //[GET] /auth/register
    showRegisterForm(req, res) {    
        res.render('client/auth/register')
    }

    //[POST] /auth/register
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
            res.redirect('/');
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new AuthController()
