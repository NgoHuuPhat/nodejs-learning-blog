const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const PostDeleteRequest = require('../../models/PostDeleteRequest')

class PostController {

    //[GET] /posts/:slug
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

            // Lấy ra các bình luận của bài viết
            const comments = await Comment.find({ post_id: post._id }).lean()
            for (const comment of comments) {
                const user = await Account.findById(comment.user_id).lean()
                comment.user = user

                // Lấy ra thông tin người trả lời bình luận
                for(const reply of comment.replies) {
                    const replyUser = await Account.findById(reply.user_id).lean()
                    reply.user = replyUser
                }
            }

            
            res.render('client/posts/details', { post, comments, author, relatedPosts })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /posts/create
    create(req, res, next) {
        res.render('client/posts/create')
    }

    //[POST] /posts/store
    async store(req, res, next) {
        try {

            let avatarPath = ''

            // Kiểm tra xem có file ảnh mới không
            if(req.file) {
                avatarPath = req.file.cloudinary_url
            } 

            // Lấy thông tin người đăng
            const authorID = res.locals.account.id

            const newPost = {
                title: req.body.title,
                content: req.body.content,
                thumbnail: avatarPath,
                author: authorID, 
                tags: req.body.tags?.split(',').map(tag => tag.trim()), //? kiểm tra xem có tồn tại không => chuyển chuỗi sang mảng
    
            };
            
            req.flash('success', 'Tạo bài viết thành công!')
            await Post.create(newPost)
            res.redirect('/me/list-post')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /posts/:id/edit
    async edit(req, res, next) {
        try {
            //Lấy khóa học trường _id = giá trị req.params.id
            const postData = await Post.findById(req.params.id).lean()
            res.render('client/posts/edit', { postData })
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /posts/:id
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

    //[DELETE] /posts/:id 
    async destroy(req, res, next) {
        try {
            await Post.deleteOne({ _id: req.params.id })
            res.redirect('back') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    
    //[POST] /posts/:id/request-delete
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

module.exports = new PostController()
