const Course = require('../../models/Course')
class SeachController {
    //[GET] /search
    async search(req, res, next) {
        try {
            const keyWord = req.query.keyword
            const regex = new RegExp(keyWord, 'i') //Lấy giá trị không phân biệt hoa thường

            const courses = await Course.find({ name: regex }).lean()
            res.render('client/search', { courses, keyWord })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new SeachController()
