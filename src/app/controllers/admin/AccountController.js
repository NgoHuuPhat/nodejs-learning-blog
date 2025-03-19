const Account = require('../../models/Account')
const Role = require('../../models/Role')
const paginatitonHelper = require('../../../helpers/pagination')
const upload = require('../../../config/multer');
const mongoose = require('mongoose');

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
            upload.single('avatar')(req, res, async (err) => {
                if (err) return next(err);
                
                //Đường dẫn tuyệt đối -> Chỉ lưu đường dẫn vào database
                const avatarPath = req.file ? `/img/${req.file.filename}` : null;
    
                // Kiểm tra xem email đã tồn tại chưa
                const existingAccount = await Account.findOne({ email: req.body.email });
                if (existingAccount) {
                    req.flash('error', 'Email đã tồn tại!');
                    return res.redirect('back'); 
                }
        
                const newAccount = {
                    fullName: req.body.fullName,
                    email: req.body.email,
                    password: req.body.password,
                    token: req.body.token,
                    role_id: req.body.role_id,
                    status: req.body.status,
                    avatar: avatarPath
                };
    
                await Account.create(newAccount);
                res.redirect('/admin/accounts');
            });
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
            await Account.updateOne({_id: req.params.id}, req.body)
            res.redirect('/admin/accounts')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new AccountController()
