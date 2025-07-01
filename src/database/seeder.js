const mongoose = require('mongoose')
const Role = require('../app/models/Role')
const Account = require('../app/models/Account')
const bcrypt = require('bcrypt')

const autoSeed = async () => {
    try {

        // Xóa dữ liệu mẫu cũ
        await Role.deleteOne({ name: 'admin' })
        await Account.deleteOne({ email: 'admin@example.com'})

        // Tạo dữ liệu mẫu mới
        const hashPassword = await bcrypt.hash('admin123', 10) 

        const adminRole = await Role.create({
            name: 'admin',
            description: 'Quản trị viên hệ thống',
            permissions: [
                'courses-category_view',
                'courses-category_create',
                'courses-category_edit',
                'courses-category_delete',
                'discounts_view',
                'discounts_create',
                'discounts_edit',
                'discounts_delete',
                'roles_view',
                'roles_create',
                'roles_edit',
                'roles_delete',
                'permissions_view',
                'permissions_edit',
                'users_view',
                'users_edit',
                'users_delete',
                'users_manage_roles',
                'posts_view',
                'posts_create',
                'posts_edit',
                'posts_delete',
                'comments_view',
                'comments_approve',
                'comments_delete',
                'settings_update',
            ],
        })

        await Account.create({
            fullName: 'Super Admin',
            email: 'admin@example.com',
            password: hashPassword,
            phone: '0123456789',
            role_id: adminRole._id,
            status: 'active',
        })

        console.log('Tạo vai trò admin và tài khoản quản trị viên thành công.') 
        
    } catch (error) {
        console.error('Lỗi khi tự động tạo dữ liệu mẫu:', error)
    }
}
module.exports = {
    autoSeed,
}