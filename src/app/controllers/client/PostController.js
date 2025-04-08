const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Post = require('../../models/Post')

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

            res.render('client/posts/details', { post, author, relatedPosts })
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
            res.redirect('/home')
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
            console.log('updateData', updateData)

             
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
}

module.exports = new PostController()
