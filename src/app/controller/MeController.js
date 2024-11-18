const Course = require('../models/Course');

class CourseController {

    //[GET] /me/stored/courses
    async storedCourses(req, res, next) {
        try {
            const courses = await Course.find({}).lean()
            res.render('me/stored-courses', { courses })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CourseController();
