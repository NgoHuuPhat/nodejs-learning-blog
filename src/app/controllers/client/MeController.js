const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Post = require('../../models/Post')
const UserCourse = require('../../models/UserCourse')
const {formatCurrency} = require('../../../utils/format')
class MeController {

    //[GET] /me/my-profile
    async myProfileRoute(req, res, next) {
        try {
            const userId = res.locals.account.id
            console.log('userId:', userId)
            
            // Lấy thông tin tài khoản người dùng
            const user = await Account.findById(userId).lean()
            if (!user) {
                res.flash('error', 'Tài khoản không tồn tại!')
                return res.redirect('/user/login')
            }

            // Đếm số lượng bài viết của người dùng
            const postCount = await Post.countDocuments({ author: userId })
            user.postCount = postCount 

            // Đếm số lượng khóa học đã đăng ký của người dùng
            const courseCount = await UserCourse.countDocuments({ user_id: userId })
            user.courseCount = courseCount

            // Lấy thông tin khóa học đã đăng ký
            const userCourses = await UserCourse.find({ user_id: userId })
            const courseIds = userCourses.map(course => course.course_id)
            const courses = await Course.find({ _id: { $in: courseIds } }).lean()

            // Định dạng giá tiền khóa học
            courses.forEach(course => {
                course.price = formatCurrency(course.price)
            })
            
            //Lấy thông tin tài khoản người dùng
            res.render('client/me/my-profile', {user, courses, courseCount})
        } catch (error) {
            next(error)
        }
    }
    
}

module.exports = new MeController()
