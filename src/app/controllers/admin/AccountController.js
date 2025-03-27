const Account = require('../../models/Account')
const Role = require('../../models/Role')
const paginatitonHelper = require('../../../helpers/pagination')
const upload = require('../../../config/multer');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class AccountController {

    //[GET] /admin/accounts
    async index(req, res, next) {
        try {

            //Đếm số lượng khóa học
            const countAccounts = await Account.countDocuments({}) 
            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1
                },
                req.query,
                countAccounts
            )
            const accounts = await Account.find({}).sortTable(req).skip(objectPagination.skip).limit(objectPagination.limitItems).select('-password -token').lean() //Loại trừ passowrd token để tránh lộ thông tin mật
            
            //Lấy name theo role
            for (const account of accounts) {
                const role = await Role.findById({_id: account.role_id}).lean()
                account.role = role
            }
            res.render('admin/accounts/list', { accounts, objectPagination, query: req.query })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/accounts/create
    async create(req, res, next) {
        try{
            const roles = await Role.find().lean()
            res.render('admin/accounts/create', { roles })

        } catch(error){
            next(error)
        }
    }

    //[POST] /admin/accounts/store
    async store(req, res, next) {
        try {    
            //Đường dẫn tuyệt đối -> Chỉ lưu đường dẫn vào database
            const avatarPath = req.file ? `/img/${req.file.filename}` : null;

            // Kiểm tra xem email đã tồn tại chưa
            const emailExists = await Account.findOne({ email: req.body.email });
            if (emailExists) {
                req.flash('error', 'Email đã tồn tại!');
                return res.redirect('back'); 
            }

            // Mã hóa password
            const hashedPassword  = await bcrypt.hash(req.body.password, saltRounds);
    
            const newAccount = {
                fullName: req.body.fullName,
                email: req.body.email,
                password: hashedPassword,
                phone: req.body.phone,
                role_id: req.body.role_id,
                status: req.body.status,
                avatar: avatarPath
            };

            await Account.create(newAccount);
            res.redirect('/admin/accounts');
        } catch (error) {
            next(error);
        }
    }

    //[GET] /admin/accounts/:id/edit
    async edit(req, res, next) {
        try {
 
            //Lấy trường _id = giá trị req.params.id
            const account = await Account.findById(req.params.id).lean() 
            const roles = await Role.find().lean() 

            res.render('admin/accounts/edit', { account, roles })
        } catch (error) {
            next(error)
        }
    }
    
    //[PATCH] /admin/accounts/:id
    async update(req, res, next) {
        try { 
            let updateData = { ...req.body }; //Tạo một bản sao mới tránh gây ảnh hưởng đến req

            // Nếu có file avatar được upload, cập nhật đường dẫn avatar
            if (req.file) {
                updateData.avatar = `/img/${req.file.filename}`;
            }

            // Kiểm tra xem email đã tồn tại chưa (loại trừ email hiện tại &ne _id)
            const emailExists = await Account.findOne({ _id: { $ne: req.params.id } , email: req.body.email });
            if (emailExists) {
                req.flash('error', `Email ${emailExists} đã tồn tại!`);
                return res.redirect('back'); 
            }

            // Kiểm tra xem người dùng có nhập mật khẩu mới hay không
            if(req.body.password){
                // Mã hóa password
                const hashedPassword  = await bcrypt.hash(req.body.password, saltRounds);
                updateData.password = hashedPassword
            } else {
                delete updateData.password //Tránh lưu mật khẩu rỗng
            }

            const a = await Account.updateOne({_id: req.params.id}, updateData)
            console.log(a
            )
            res.redirect('/admin/accounts')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/accounts/:id
    async delete(req, res, next) {
        try {
            const account = await Account.findById(req.params.id)
            if(account){
                // Nếu có avatar, xóa file ảnh
                if(account.avatar){
                    const filePath = path.join(__dirname, '../../../public', account.avatar)

                    // Kiểm tra xem file có tồn tại trước khi xóa
                    if(fs.existsSync(filePath)){
                        fs.unlinkSync(filePath)
                    }
                }
                await Account.deleteOne({_id: req.params.id})
            }
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AccountController()
