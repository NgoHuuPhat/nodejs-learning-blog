const Course = require('../../models/Course')
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
            res.render('client/home',{ courses })
        } catch (error) {
            next(error) //Xử lí lỗi ở 1 nơi khác
        }
        
    }

    //[GET] /search
    async search(req, res, next) {
        try {
            const keyWord = req.query.keyword 
            const regex = new RegExp(keyWord,  "i"); //Lấy giá trị không phân biệt hoa thường
            
            const courses = await Course.find({name: regex}).lean() 
            res.render('client/home', { courses, keyWord })
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new SiteController()
