const Course = require('../../models/Course')
const Post = require('../../models/Post')
class SeachController {
    
    //[GET] /
    async search(req, res, next) {
        try {
            const keyword = req.query.keyword
            const regex = new RegExp(keyword, 'i') //Lấy giá trị không phân biệt hoa thường
            const typeSearch = req.query.type || 'courses'

            if( typeSearch === 'courses') {
                const courses = await Course.find({ name: regex }).lean()
                return res.render('client/search/index', { courses, keyword, currentTab: typeSearch })
            }
            else if( typeSearch === 'posts') {
                const posts = await Post.find({ title: regex, status: 'approved' }).lean()

                return res.render('client/search/index', { posts, keyword, currentTab: typeSearch })  //currentTab để xác định tab nào đang được chọn
            }
            
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new SeachController()
