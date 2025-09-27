const mongoose = require('mongoose')
const Role = require('../app/models/Role')
const Account = require('../app/models/Account')
const bcrypt = require('bcrypt')

const autoSeed = async () => {
    try {
        // ========== TẠO ROLE USER ==========
        let userRole = await Role.findOne({ name: 'user' })
        if (!userRole) {
            userRole = await Role.create({
                name: 'user',
                description: 'Người dùng thường',
                permissions: [
                    'posts_view',
                    'posts_create', 
                    'comments_view',
                    'comments_create',
                    'profile_view',
                    'profile_edit',
                ],
            })
            console.log('✅ Tạo role user thành công.')
        } else {
            console.log('✅ Role user đã tồn tại, không tạo lại.')
        }

        // ========== TẠO ROLE ADMIN ==========
        let adminRole = await Role.findOne({ name: 'admin' })
        if (!adminRole) {
            adminRole = await Role.create({
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
            console.log('✅ Tạo role admin thành công.')
        } else {
            console.log('✅ Role admin đã tồn tại, không tạo lại.')
        }

        // ========== TẠO ACCOUNT ADMIN ==========
        let adminAccount = await Account.findOne({ email: 'admin@example.com' })
        if (!adminAccount) {
            const hashPassword = await bcrypt.hash('admin123', 10)
            await Account.create({
                fullName: 'Super Admin',
                email: 'admin@example.com',
                password: hashPassword,
                phone: '0123456789',
                role_id: adminRole._id,
                status: 'active',
                loginType: 'local'
            })
            console.log('✅ Tạo tài khoản quản trị viên thành công.')
        } else {
            console.log('✅ Tài khoản admin đã tồn tại, không tạo lại.')
        }

        // ========== TẠO ACCOUNT USER MẪU (Optional) ==========
        let testUser = await Account.findOne({ email: 'user@example.com' })
        if (!testUser) {
            const hashPassword = await bcrypt.hash('user123', 10)
            await Account.create({
                fullName: 'Test User',
                email: 'user@example.com',
                password: hashPassword,
                phone: '0987654321',
                role_id: userRole._id,
                status: 'active',
                loginType: 'local'
            })
            console.log('✅ Tạo tài khoản user mẫu thành công.')
        } else {
            console.log('✅ Tài khoản user mẫu đã tồn tại, không tạo lại.')
        }

    } catch (error) {
        console.error('❌ Lỗi khi tự động tạo dữ liệu mẫu:', error)
        throw error
    }
}

module.exports = {
    autoSeed,
}