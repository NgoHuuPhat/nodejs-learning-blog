const Course = require('../models/Course');
class SiteController {
    //[GET] /
    async home(req, res, next) {
        try {
            /*Fix lỗi handlebars (Object Contrustor -> Object Literal)
            C1: lean() => Ưu tiên
            C2: toObject() (thay const = let)
            */
            const courses = await Course.find({}).lean(); // Đợi Promise trả về kết quả (find() trả về Array)
            // courses = courses.map(course => course.toObject()) 
            res.render('home',{ courses })
        } catch (error) {
            next(error) //Xử lí lỗi ở 1 nơi khác
        }
        
    }

    //[GET] /search
    search(req, res) {
        res.render('search');
    }
}

module.exports = new SiteController();
