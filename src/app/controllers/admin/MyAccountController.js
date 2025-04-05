const Account = require('../../models/Account')
const Role = require('../../models/Role')
const upload = require('../../../config/multer')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcrypt')
const saltRounds = 10

class MyAccountController {
    //[GET] /admin/my-account
    async index(req, res) {
        try {
            //Lấy ra thông tin account
            const myAccount = await Account.findOne({
                _id: res.locals.account.id,
            }).lean()

            //Lấy ra tên role
            const myRole = await Role.findOne({ _id: myAccount.role_id }).lean()

            // Chuyển đổi createdAt sang định dạng DD/MM/YYYY
            myAccount.createdAt = new Date(
                myAccount.createdAt,
            ).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            })

            res.render('admin/my-account/details', { myAccount, myRole })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/my-account/:id/edit
    async edit(req, res, next) {
        try {
            //Lấy trường _id = giá trị req.params.id
            const myAccount = await Account.findById(req.params.id).lean()
            const roles = await Role.find().lean()

            res.render('admin/my-account/edit', { myAccount, roles })
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/my-account/:id
    async update(req, res, next) {
        try {
            let updateData = { ...req.body } //Tạo một bản sao mới tránh gây ảnh hưởng đến req

            // Nếu có file avatar được upload, cập nhật đường dẫn avatar
            if (req.file) {
                updateData.avatar = `/img/${req.file.filename}`
            }

            // Kiểm tra xem email đã tồn tại chưa (loại trừ email hiện tại &ne _id)
            const emailExists = await Account.findOne({
                _id: { $ne: req.params.id },
                email: req.body.email,
            })
            if (emailExists) {
                req.flash('error', `Email ${emailExists} đã tồn tại!`)
                return res.redirect('back')
            }

            // Kiểm tra xem người dùng có nhập mật khẩu mới hay không
            if (req.body.password) {
                // Mã hóa password
                const hashedPassword = await bcrypt.hash(
                    req.body.password,
                    saltRounds,
                )
                updateData.password = hashedPassword
            } else {
                delete updateData.password //Tránh lưu mật khẩu rỗng
            }

            const a = await Account.updateOne(
                { _id: req.params.id },
                updateData,
            )

            // Lấy thông tin mới cập nhật
            const updatedAccount = await Account.findById(req.params.id).lean()

            // Trả về JSON thay vì redirect
            res.json({
                success: 'Cập nhật thành công!',
                fullName: updatedAccount.fullName,
                avatar: updatedAccount.avatar,
                redirectUrl: '/admin/my-account',
            })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new MyAccountController()
