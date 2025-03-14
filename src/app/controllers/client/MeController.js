const Course = require('../../models/Course')
const paginatitonHelper = require('../../../helpers/pagination')

class CourseController {

    //[GET] /me/stored/courses
    async storedCourses(req, res, next) {
        try {

            //Đếm số lượng khóa học
            const countCourses = await Course.countDocuments({ deleted: false }) 
            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1
                },
                req.query,
                countCourses
            )

            //Dùng destructuring
            const [courses, countDeleted] = await Promise.all([
                Course.find({deleted: false}).sortTable(req).skip(objectPagination.skip).limit(objectPagination.limitItems).lean(), 
                Course.countDocumentsWithDeleted({deleted: true})
            ]) 
            res.render('client/me/stored-courses', { courses, countDeleted, objectPagination, query: req.query })
        } catch (error) {
            next(error)
        }
    }



    //[GET] /me/trash/courses
    async trashCourses(req, res, next){
        try {
            const courses = await Course.findWithDeleted({deleted: true}).lean()
            res.render('client/me/trash-courses', { courses })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CourseController()
