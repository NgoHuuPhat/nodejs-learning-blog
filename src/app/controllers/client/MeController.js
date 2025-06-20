const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Post = require('../../models/Post')
const paginatitonHelper = require('../../../utils/pagination')

class MeController {
    //[GET] /me/stored/courses
    async storedCourses(req, res, next) {
        try {
            //Đếm số lượng khóa học
            const countCourses = await Course.countDocuments({ deleted: false })
            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1,
                },
                req.query,
                countCourses,
            )

            //Dùng destructuring
            const [courses, countDeleted] = await Promise.all([
                Course.find({ deleted: false })
                    .sortTable(req)
                    .skip(objectPagination.skip)
                    .limit(objectPagination.limitItems)
                    .lean(),
                Course.countDocumentsWithDeleted({ deleted: true }),
            ])
            res.render('client/me/stored-courses', {
                courses,
                countDeleted,
                objectPagination,
                query: req.query,
            })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /me/trash/courses
    async trashCourses(req, res, next) {
        try {
            const courses = await Course.findWithDeleted({
                deleted: true,
            }).lean()
            res.render('client/me/trash-courses', { courses })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /me/my-profile
    async myProfileRoute(req, res, next) {
        try {
            res.render('client/me/my-profile')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /me/list-post
    async myPostsRoute(req, res, next) {
        try {
            //Lấy danh sách bài viết theo trạng thái
            const statusPage = req.query.status || 'pending'
            
            const posts = await Post.find({status: statusPage}).lean()
            res.render('client/me/list-post', { posts, currentTab: statusPage }) //currentTab để xác định tab nào đang được chọn
        } catch (error) {
            next(error)
        }
    }
    
}

module.exports = new MeController()
