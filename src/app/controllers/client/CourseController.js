const Course = require('../../models/Course')
const Chapter = require('../../models/Chapter')
const Lesson = require('../../models/Lesson')
const UserCourse = require('../../models/UserCourse')
const Discount = require('../../models/Discount')
const Payment = require('../../models/Payment')
const {formatDuration, formatCurrency} = require('../../../utils/format')

class CourseController {
    //[GET] /courses/:slug
    async details(req, res, next) {
        try {

            let countChapters = 0
            let countLessons = 0
            let totalDuration = 0 
            let chapters =  []
            let lessons = []

            // Lấy khóa học trường slug = giá trị req.params.slug
            const course = await Course.findOne({
                slug: req.params.slug,
            }).lean()
            
            if(course){
                // Kiểm tra người dùng đã mua khóa học chưa
                const userCourse = await UserCourse.findOne({
                    user_id: res.locals.account.id,
                    course_id: course._id,
                    status: 'active'
                })

                if(userCourse) {
                    const firstChapter = await Chapter.findOne({ course_id: course._id }).sort({ _id: 1 })
                    if( firstChapter) {
                        const lessonIdFirst = await Lesson.findOne({ chapter_id: firstChapter._id }).sort({ _id: 1 })
                        if(lessonIdFirst) {
                            res.redirect(`/learning/${course.slug}?id=${lessonIdFirst._id}`)
                        }      
                    }   
                }

                // Kiểm tra session có mã giảm giá không
                if (req.session.discount && req.session.discount.courseId == course._id.toString()) {   
                    course.totalPrice = formatCurrency(course.price - req.session.discount.discountAmount)
                    course.discountCode = req.session.discount.code
                }
                
                // Định dạng giá tiền
                course.price = formatCurrency(course.price) 

                // Đếm số chương của khóa học
                chapters = await Chapter.find({ course_id: course._id }).lean()
                countChapters = chapters.length

                const chapterIds = chapters.map(chapter => chapter._id)
                lessons = await Lesson.find({ chapter_id: { $in: chapterIds } }).lean()

                // Gắn bài học vào từng chương
                chapters = chapters.map(chapter => {
                    // Lọc các bài học thuộc chapter hiện tại
                    const chapterLessons = lessons.filter(lesson => lesson.chapter_id.toString() === chapter._id.toString())
                    const countLessonsInChapter = chapterLessons.length
                    return {
                        ...chapter,
                        countLessonsInChapter,
                        lessons: chapterLessons.map(lesson => ({
                            ...lesson,
                            duration: formatDuration(lesson.videoLesson.duration),
                        }))
                    }
                })

                // Tổng số lượng thời gian của bài học
                totalDuration = lessons.reduce((total, lesson)=> {
                    return total + lesson.videoLesson.duration
                }, 0)
                
                // Đếm số bài học  của khóa học
                countLessons = await Lesson.countDocuments({ chapter_id: { $in: chapterIds } })
            }
            res.render('client/courses/details', { 
                course, 
                chapters, 
                lessons, 
                useDiscount: req.session.discount? formatCurrency(req.session.discount.discountAmount) : 0,
                countChapters, 
                countLessons, 
                totalDuration: formatDuration(totalDuration),
            })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /courses/:slug/apply-discount
    async applyDiscount(req, res, next) {
        try {

            const discountCode = req.query.discount_code
            const courseId = req.query.course_id

            // Lấy ra khóa học theo id 
            const course = await Course.findById(courseId)
        
            // Tìm kiếm mã giảm giá theo mã và khóa học
            const discount = await Discount.findOne({
                code: discountCode,
                courseIds: courseId,
            })

            // Kiểm tra xem mã giảm giá có tồn tại và áp dụng cho khóa học này không
            if (!discount) {
                req.flash('error', 'Mã giảm giá không tồn tại hoặc không áp dụng cho khóa học này.')
                return res.redirect(`/courses/${req.params.slug}`)
            }
            
            // Kiểm tra xem mã giảm giá còn hiệu lực không
            if (discount.usedCount >= discount.maxUses || new Date() < discount.startDate || new Date() > discount.endDate) {
                return res.status(400).send('Mã giảm giá không hợp lệ hoặc đã hết hạn.')
            }

            // Tính số tiền giảm giá
            const discountAmount = discount.type === 'percentage'? (discount.value / 100) * course.price : discount.value; 

            // Lưu thông tin mã giảm giá vào session 
            req.session.discount = {
                code: discountCode,
                courseId: courseId,
                discountAmount: discountAmount,
            }

            // Chuyển hướng đến trang khóa học với mã giảm giá đã áp dụng
            res.redirect(`/courses/${req.params.slug}?course=${courseId}&code=${encodeURIComponent(discountCode)}&openDiscountModal=true`)
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CourseController()
