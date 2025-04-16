const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const PostDeleteRequest = require('../../models/PostDeleteRequest')

class CommentController {

    //[GET] /comments/:slug
    async details(req, res, next) {
        try {
            //Lấy khóa học trường slug = giá trị req.params.slug
            const post = await Post.findOne({
                slug: req.params.slug,
            }).lean()

            // Tăng view
            await Post.updateOne({ slug: req.params.slug }, { $inc: { views: 1 } })

            // Lấy ra các dự án nổi bật khác
            const relatedPosts = await Post.find({slug: {$ne: req.params.slug}}).sort({views: -1}).limit(6).lean()
            
            //Lấy thông tin người đăng
            const author = await Account.findById(post.author).lean()

            res.render('client/comments/details', { post, author, relatedPosts })
        } catch (error) {
            next(error)
        }
    }

    //[POST] /comments/:id
    async create(req, res, next) {
        try {
            if(req.params.id && res.locals.account.id){
                const newComment = {
                    post_id: req.params.id,
                    user_id: res.locals.account.id,
                    content: req.body.content,
                }
                await Comment.create(newComment)
            }

            // Tăng số lượng bình luận của bài viết
            await Post.updateOne({ _id: req.params.id }, { $inc: { commentCount: 1 } })
            res.redirect(req.get('referer') + '?showComments=true')
        } catch (error) {
            next(error)
        }
    }

    //[POST] /comments/:id/reply
    async replyComment(req, res, next) {
        try {

            if(req.body && req.params.id){
                await Comment.updateOne(
                    { _id: req.params.id },
                    { $push: { replies: {user_id: res.locals.account.id, content: req.body.replies} } }
                )
            }

            // Lấy ra bài viết
            const comment = await Comment.findById(req.params.id)

            // Tăng số lượng bình luận của bài viết
            if(comment) {
                await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: 1 } })
            }

            res.redirect(req.get('referer') + '?showComments=true')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /comments/:id/edit
    async edit(req, res, next) {
        try {
            //Lấy khóa học trường _id = giá trị req.params.id
            const postData = await Post.findById(req.params.id).lean()
            res.render('client/comments/edit', { postData })
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /comments/:id
    async update(req, res, next) {
        try {
            let updateData = {...req.body}
            
            // Kiểm tra xem có file ảnh mới không
            if(req.file) {
                updateData.thumbnail = req.file.cloudinary_url
            }

            // Kiểm tra xem bài viết có bị từ chối không
            const post = await Post.findById(req.params.id)
            if (post.status === 'rejected') {
                updateData.status = 'pending'
            }

            // Kiểm tra xem bài viết đã được duyệt chưa
            if (post.status === 'approved') {
                req.flash('error', 'Bài viết đã được duyệt không thể chỉnh sửa!')
                return res.redirect('/me/list-post?status=approved')
            }

            // Kiểm tra xem có tags không
            if (req.body.tags) {
                updateData.tags = req.body.tags.split(',').map(tag => tag.trim())
            }
            
            await Post.updateOne({ _id: req.params.id }, updateData)
            req.flash('success', 'Cập nhật bài viết thành công!')
            res.redirect('/me/list-post')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /comments/:id 
    async destroy(req, res, next) {
        try {
            await Post.deleteOne({ _id: req.params.id })
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    
    //[POST] /comments/:id/request-delete
    async requestDelete(req, res, next) {
        try {

            // Kiểm tra xem trước đó đã gửi yêu cầu chưa
            const existingRequest = await PostDeleteRequest.findOne({
                post_id: req.params.id,
                user_id: res.locals.account.id,
            })
            if (existingRequest) {
                req.flash('error', 'Bạn đã gửi yêu cầu xóa bài viết này trước đó. Hãy chờ admin duyệt yêu cầu của bạn!')
                return res.redirect('back') //'back' về lại trang trước đó
            }

            // Tạo yêu cầu xóa bài viết
            const newRequest = {
                post_id: req.params.id,
                user_id: res.locals.account.id,
                reason: req.body.reason,
            }
        
            await PostDeleteRequest.create(newRequest)
            req.flash('success', 'Yêu cầu xóa bài viết thành công. Hãy chờ admin duyệt yêu cầu của bạn!')
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new CommentController()
