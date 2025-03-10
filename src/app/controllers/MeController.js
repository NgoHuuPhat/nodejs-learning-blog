const Course = require('../models/Course')

class CourseController {

    //[GET] /me/stored/courses
    async storedCourses(req, res, next) {
        try {

            let objectPagination = {
                limitItems: 4,
                currentPage: 1
            }
            if(req.query.page){
                objectPagination.currentPage = parseInt(req.query.page) // String nên phải chuyển sang number
            }

            //Công thức phân trang 
            objectPagination.skip = (objectPagination.currentPage - 1) * objectPagination.limitItems

            //Tính tổng số trang
            const countCourses = await Course.countDocuments({ deleted: false }) 
            const totalPage = Math.ceil(countCourses/objectPagination.limitItems)
            objectPagination.totalPage = totalPage

            //Dùng destructuring
            const [courses, countDeleted] = await Promise.all([
                Course.find({}).lean().limit(objectPagination.limitItems).skip(objectPagination.skip), // sortTable có thể dùng sau khi fix
                Course.countDocumentsWithDeleted({deleted: true})
            ]) 
            res.render('me/stored-courses', { courses, countDeleted, objectPagination })
        } catch (error) {
            next(error)
        }
    }



    //[GET] /me/trash/courses
    async trashCourses(req, res, next){
        try {
            const courses = await Course.findWithDeleted({deleted: true}).lean()
            res.render('me/trash-courses', { courses })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CourseController()
