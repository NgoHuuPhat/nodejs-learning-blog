const Role = require('../../models/Role')
const paginatitonHelper = require('../../../helpers/pagination')
const dateTime = require('../../../helpers/dateTime')

class RoleController {
    //[GET] /admin/roles
    async listRoles(req, res, next) {
        try {
            //Đếm số lượng khóa học
            const countRoles = await Role.countDocuments({})
            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1,
                },
                req.query,
                countRoles,
            )

            const roles = await Role.find({})
                .sortTable(req)
                .skip(objectPagination.skip)
                .limit(objectPagination.limitItems)
                .lean()

            for(const role of roles) {
                role.createdAt = dateTime(role.createdAt)
            }

            res.render('admin/roles/list', {
                roles,
                objectPagination,
                query: req.query,
            })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/roles/create
    create(req, res, next) {
        res.render('admin/roles/create')
    }

    //[POST] /admin/roles/store
    async store(req, res, next) {
        try {
            await Role.create(req.body)
            res.redirect('/admin/roles')
        } catch (error) {
            if (error.code === 11000) {
                // Mã lỗi 11000 là lỗi unique
                return res.render('admin/roles/create', {
                    error: 'Tên nhóm quyền đã tồn tại!',
                    role: req.body,
                })
            }
            next(error)
        }
    }

    //[GET] /admin/roles/:id/edit
    async edit(req, res, next) {
        try {
            //Lấy nhóm quyền trường _id = giá trị req.params.id
            const role = await Role.findById(req.params.id).lean()
            res.render('admin/roles/edit', { role })
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/roles/:id
    async update(req, res, next) {
        try {
            await Role.updateOne({ _id: req.params.id }, req.body)
            res.redirect('/admin/roles')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/roles/:id
    async delete(req, res, next) {
        try {
            await Role.deleteOne({ _id: req.params.id })
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/roles/permissions
    async permissions(req, res, next) {
        try {
            //Lấy nhóm quyền trường _id = giá trị req.params.id
            const records = await Role.find({ name: { $ne: 'User' } }).lean() //Loại bỏ User

            //Lấy JSON string để sử dụng ở FE (Dùng en... để mã hóa fix lỗi khi render HTML)
            const formatRecords = encodeURIComponent(JSON.stringify(records))
            res.render('admin/roles/permissions', {
                records,
                formatRecords,
                colspan: records.length + 1,
            })
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/roles/permissions
    async permissionsPatch(req, res, next) {
        try {
            const permissions = JSON.parse(req.body.permissions)
            console.log(permissions)

            for (const item of permissions) {
                await Role.updateOne(
                    { _id: item.id },
                    { permissions: item.permissions },
                )
            }
            // Thông báo thành công
            req.flash('success', 'Cập nhật phân quyền thành công!')
            res.redirect('back')
        } catch (error) {
            // Thông báo thất bại
            req.flash('error', 'Có lỗi xảy ra khi cập nhật phân quyền!')
            next(error)
        }
    }
}

module.exports = new RoleController()
