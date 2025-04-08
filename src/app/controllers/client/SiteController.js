const Course = require('../../models/Course')
const Post = require('../../models/Post')
const Account = require('../../models/Account')
class SiteController {
    //[GET] /
    async home(req, res, next) {
        try {
            /*Fix lỗi handlebars (Object Contrustor -> Object Literal)
            C1: lean() => Ưu tiên
            C2: toObject() (thay const = let)
            */
            const courses = await Course.find({}).lean() // Đợi Promise return kết quả (find() return Array)
            const posts = await Post.find({}).lean() 
            
            // Lấy ra tên người viết bài viết
            for(const post of posts) {
                const account = await Account.findById(post.author).lean()
                post.author = account.fullName
                post.avatarAuthor = account.avatar
            }

            // courses = courses.map(course => course.toObject())
            res.render('client/home', { courses, posts })
        } catch (error) {
            next(error) //Xử lí lỗi ở 1 nơi khác
        }
    }

    //[GET] /search
    async search(req, res, next) {
        try {
            const keyWord = req.query.keyword
            const regex = new RegExp(keyWord, 'i') //Lấy giá trị không phân biệt hoa thường

            const courses = await Course.find({ name: regex }).lean()
            res.render('client/home', { courses, keyWord })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new SiteController()
