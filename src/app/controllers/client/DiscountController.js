const Discount = require('../../models/Discount')
const Account = require('../../models/Account')
const { formatDate, formatCurrency } = require('../../../utils/format')
const moment = require('moment')
const paginatitonHelper = require('../../../utils/pagination')
const Course = require('../../models/Course')

class DiscountController {
    //[GET] /client/discounts
    async index(req, res, next) {
        try {
            const discounts = await Discount.find({}).lean()
            const totalCourseCount = await Course.countDocuments({ deleted: false })

            // Lấy danh sách mã giảm giá còn hiệu lực
            const validDiscounts = []

            for(const discount of discounts) {
                if(discount.startDate <= Date.now() && discount.endDate >= Date.now()) {
                    if(discount.applyToAllCourses || discount.courseIds.length === totalCourseCount) {
                        discount.courseDisplay  = 'Tất cả khóa học'
                    } else {
                        const courses = await Course.find({_id: {$in: discount.courseIds}})
                        discount.courseDisplay = courses.map(course => course.name).join(', ')
                    } 

                    discount.remaining = discount.maxUses - discount.usedCount
                    discount.endDateFormatted = formatDate(discount.endDate)

                    // Chuyển đổi endDate sang định dạng ISO
                    discount.endDateISO = discount.endDate.toISOString();
                    discount.timediff = discount.endDate - discount.startDate;

                    // Chuyển đổi tiền tệ
                    if(discount.type === 'fixed') {
                        discount.value = formatCurrency(discount.value)
                    }

                    validDiscounts.push(discount)
                }   
            }
            
            console.log(validDiscounts)

            res.render('client/discounts/index', {discounts: validDiscounts})
            
        } catch (error) {
            next(error)
        }
    }
    
}

module.exports = new DiscountController()
