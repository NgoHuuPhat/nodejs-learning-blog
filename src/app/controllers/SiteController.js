const Course = require('../models/Course')
class SiteController {
    //[GET] /
    async home(req, res, next) {
        try {
            /*Fix lỗi handlebars (Object Contrustor -> Object Literal)
            C1: lean() => Ưu tiên
            C2: toObject() (thay const = let)
            */
            const courses = await Course.find({}).lean() // Đợi Promise return kết quả (find() return Array)
            // courses = courses.map(course => course.toObject()) 
            res.render('home',{ courses })
        } catch (error) {
            next(error) //Xử lí lỗi ở 1 nơi khác
        }
        
    }
}

module.exports = new SiteController()
