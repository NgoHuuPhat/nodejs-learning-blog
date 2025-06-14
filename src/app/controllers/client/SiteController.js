const Course = require('../../models/Course')
const Post = require('../../models/Post')
const Account = require('../../models/Account')
const { formatCurrency } = require('../../../helpers/format')
class SiteController {
    //[GET] /
    async home(req, res, next) {
        try {
            /*Fix lỗi handlebars (Object Contrustor -> Object Literal)
            C1: lean() => Ưu tiên
            C2: toObject() (thay const = let)
            */
            const courses = await Course.find({}).lean() // Đợi Promise return kết quả (find() return Array)

            // Định dạng giá tiền
            for(const course of courses) {
                course.price = formatCurrency(course.price)
            }
            const posts = await Post.find({status: 'approved'}).lean() 
            
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
}

module.exports = new SiteController()
