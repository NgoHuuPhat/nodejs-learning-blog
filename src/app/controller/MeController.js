const Course = require('../models/Course');

class CourseController {

    //[GET] /me/stored/courses
    async storedCourses(req, res, next) {
        try {
            
            //Dùng destructuring
            const [courses, countDeleted] = await Promise.all([Course.find({}).lean(), Course.countDocumentsWithDeleted({deleted: true})]) 
            res.render('me/stored-courses', { courses, countDeleted })
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

module.exports = new CourseController();
