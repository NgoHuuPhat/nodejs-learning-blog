const Discount = require('../../models/Discount')
const Account = require('../../models/Account')
const { formatDate } = require('../../../utils/format')
const moment = require('moment')
const paginatitonHelper = require('../../../utils/pagination')
const Course = require('../../models/Course')

class DiscountController {
    //[GET] /admin/discounts
    async index(req, res,next) {
        try {
            //Đếm số lượng khóa học
            const countDiscounts = await Discount.countDocuments({ deleted: false })
            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1,
                },
                req.query,
                countDiscounts,
            )

            //Dùng destructuring
            const [discounts, countDeleted] = await Promise.all([
                Discount.find({ deleted: false })
                    .sortTable(req)
                    .skip(objectPagination.skip)
                    .limit(objectPagination.limitItems)
                    .lean(),
                Discount.countDocumentsWithDeleted({ deleted: true }),
            ])

            // Lấy thông tin người tạo
            for(const discount of discounts) {
                const account = await Account.findById(discount.createdBy.account_id).lean()
                discount.createdBy.fullName = account.fullName
                discount.startDate = formatDate(discount.startDate)
                discount.endDate = formatDate(discount.endDate)
            }

            res.render('admin/discounts/list',{                
                discounts,
                countDeleted,
                objectPagination,
                query: req.query,
            })
        } catch (error) {
            next(error)
        }
    }  
    
    //[GET] /admin/discounts/create
    async create(req, res, next) {
        try {
            // Lấy danh sách khóa học để áp dụng mã giảm giá
            const courses = await Course.find({ deleted: false }).lean()
            res.render('admin/discounts/create', {courses})
        } catch (error) {
            next(error)
        }
    }

    //[POST] /admin/discounts/store
    async store(req, res, next) {
        try {
            console.log(req.body)

            // Set lại thời gian bắt đầu và kết thúc
            const startDate = new Date(req.body.startDate)
            startDate.setHours(0, 0, 0, 0) 
            
            const endDate = new Date(req.body.endDate)
            endDate.setHours(23, 59, 59, 999)

            await Discount.create({
                code: req.body.code,
                description: req.body.description,
                type: req.body.type,
                applyToAllCourses: req.body.applyToAllCourses ? true : false, 
                courseIds: req.body.applyToAllCourses ? [] : req.body.courseIds, 
                value: req.body.value,
                maxUses: req.body.maxUses,
                startDate: startDate,
                endDate: endDate, 
                usedCount: 0,
                createdBy: {
                    account_id: res.locals.account.id,
                },
            })

            //Thông báo thành công
            req.flash('success', 'Tạo mã giảm giá thành công!')
            res.redirect('/admin/discounts')
        }
        catch (error) {
            next(error)
        }
    }

    //[GET] /admin/discounts/trash
    async trashCourses(req, res, next) {
        try {
            const discounts = await Discount.findWithDeleted({
                deleted: true,
            }).lean()

            for( const discount of discounts) {
                discount.startDate = moment(discount.startDate).format('YYYY-MM-DD')
                discount.endDate = moment(discount.endDate).format('YYYY-MM-DD')       
            }

            res.render('admin/discounts/trash-discounts', { discounts })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/discounts/:id/edit
    async edit(req, res, next) {
        try {
            const discount = await Discount.findById(req.params.id).lean()
            if (!discount) {
                req.flash('error', 'Mã giảm giá không tồn tại!')
                return res.redirect('/admin/discounts')
            }
            discount.courseIds = discount.courseIds.map((courseId) => courseId.toString()) 

            // Chuyển đổi định dạng ngày tháng
            discount.startDate = moment(discount.startDate).format('YYYY-MM-DD')
            discount.endDate = moment(discount.endDate).format('YYYY-MM-DD')

            // Lấy danh sách khóa học để áp dụng mã giảm giá
            const courses = await Course.find({ deleted: false }).lean()
            courses.forEach(course => {
                course._id = course._id.toString() 
            })

            res.render('admin/discounts/edit', { discount, courses })
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/discounts/:id
    async update(req, res, next) {
        try {
            // Set lại thời gian bắt đầu và kết thúc
            const startDate = new Date(req.body.startDate)
            startDate.setHours(0, 0, 0, 0)

            const endDate = new Date(req.body.endDate)
            endDate.setHours(23, 59, 59, 999)

            await Discount.updateOne(
                { _id: req.params.id },
                {
                    code: req.body.code,
                    description: req.body.description || '',
                    type: req.body.type,
                    applyToAllCourses: req.body.applyToAllCourses ? true : false,
                    courseIds: req.body.applyToAllCourses ? [] : req.body.courseIds,
                    value: req.body.value,
                    maxUses: req.body.maxUses,
                    startDate: startDate,
                    endDate: endDate,
                },
            )

            //Thông báo thành công
            req.flash('success', 'Cập nhật mã giảm giá thành công!')
            res.redirect('/admin/discounts')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/discounts/:id
    async destroy(req, res, next) {
        try {
            await Discount.delete({ _id: req.params.id })
            req.flash('success', 'Xóa mã giảm giá thành công!')
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/discounts/:id/restore
    async restore(req, res, next) {
        try {
            await Discount.restore({ _id: req.params.id })
            const discountRestore = await Discount.findOne({ _id: req.params.id })
            req.flash('success', `Đã khôi phục mã giảm giá ${discountRestore.code}!`)
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/discounts/:id/force
    async forceDelete(req, res, next) {
        try {
            // Lấy id của mã giảm giá để thông báo sau khi xóa
            const discount = await Discount.findOneDeleted({_id: req.params.id })
            if (!discount) {
                req.flash('error', 'Mã giảm giá không tồn tại!')
                return res.redirect('/admin/discounts/trash')
            }

            // Xóa vĩnh viễn mã giảm giá
            await Discount.deleteOne({ _id: req.params.id })
            req.flash('success', `Đã xóa vĩnh viễn mã giảm giá ${discount.code}!`)
            res.redirect('/admin/discounts/trash')
        } catch (error) {
            next(error)
        }
    }

    //[POST] /admin/discounts/handle-form-actions
    async handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                try {
                    await Discount.delete({ _id: req.body.discountIDs })
                    res.redirect('back') //'back' về lại trang trước đó
                } catch (error) {
                    next(error)
                }
                break
            default:
                res.flash('error', 'Hành động không hợp lệ!')
                res.redirect('back') //'back' về lại trang trước đó
                break
        }
    }
}

module.exports = new DiscountController()
