const Post = require('../../models/Post')
const Account = require('../../models/Account')
const paginatitonHelper = require('../../../helpers/pagination')
const dateTime = require('../../../helpers/dateTime')

class PostController {
    //[GET] /admin/posts
    async index(req, res, next) {
        try {
            //Đếm số lượng khóa học
            const countPosts = await Post.countDocuments({ deleted: false })
            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1,
                },
                req.query,
                countPosts,
            )

            //Dùng destructuring
            const [posts, countDeleted] = await Promise.all([
                Post.find({ deleted: false })
                    .sortTable(req)
                    .skip(objectPagination.skip)
                    .limit(objectPagination.limitItems)
                    .lean(),
                Post.countDocumentsWithDeleted({ deleted: true }),
            ])

            //Lây ra tên người tạo
            for (let post of posts) {
                const user = await Account.findOne({
                    _id: post.author,
                }).lean()

                if (user) {
                    post.author = user.fullName
                }

                // Chuyển đổi createdAt sang định dạng DD/MM/YYYY
                post.createdAt = dateTime(post.createdAt)
            }

            res.render('admin/posts/list', {
                posts,
                countDeleted,
                objectPagination,
                query: req.query,
            })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /posts/create
    create(req, res, next) {
        res.render('admin/posts/create')
    }

    //[POST] /posts/store
    async store(req, res, next) {
        try {
            //Lưu người tạo khóa học
            req.body.createdBy = {
                account_id: res.locals.account.id,
            }

            //Gán giá trị image (Tương tự như default ở bên Schema)
            req.body.image = `https://i.ytimg.com/vi/${req.body.videoID}/hqdefault.jpg?s%E2%80%A6EIYAXABwAEG&rs=AOn4CLBwYwrOaKarfa87-f5y6U_UtM0Cfg`
            await Post.create(req.body) //Lưu vào database (có thể dùng .save())

            //Điều hướng về trang home
            res.redirect('/admin/posts')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/posts/trash
    async trashPosts(req, res, next) {
        try {
            const posts = await Post.findWithDeleted({
                deleted: true,
            }).lean()
            res.render('admin/posts/trash-posts', { posts })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/posts/:id/edit
    async edit(req, res, next) {
        try {
            //Lấy khóa học trường _id = giá trị req.params.id
            const course = await Post.findById(req.params.id).lean()
            res.render('admin/posts/edit', { course })
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/posts/:id
    async update(req, res, next) {
        try {

            //Nếu tồn tại trạng thái mới thì cập nhật trạng thái
            if(req.query.newstatus){
                await Post.updateOne(
                    { _id: req.params.id },
                    {
                        status: req.query.newstatus,
                    },
                )
            }
            
            req.flash('success', 'Cập nhật thành công')
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/posts/:id
    async destroy(req, res, next) {
        try {
            //Xóa mềm lưu thông tin người xóa
            await Post.updateOne(
                { _id: req.params.id },
                {
                    deletedBy: {
                        account_id: res.locals.account.id,
                        deletedAt: new Date(),
                    },
                },
            )

            //Chính thức xóa mềm
            await Post.delete({ _id: req.params.id })
            res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/posts/:id/restore
    async restore(req, res, next) {
        try {
            await Post.restore({ _id: req.params.id })
            res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[POST] /admin/posts/handle-form-actions
    async handleFormActions(req, res, next) {
        console.log(req.body)
        switch (req.body.action) {
            case 'delete':
                try {
                    await Post.delete({ _id: req.body.courseIDs })
                    res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
                } catch (error) {
                    next(error)
                }
                break
            default:
                res.json({ message: 'Action in valid' })
        }
    }

    //[DELETE] /admin/posts/:id/force
    async forceDestroy(req, res, next) {
        try {
            await Post.deleteOne({ _id: req.params.id })
            res.redirect(req.get('Referrer') || '/') //'back' về lại trang trước đó
        } catch (error) {
            next(error)
        }
    }

    //[GET] /courses/:slug
    async details(req, res, next) {
        try {
            //Lấy khóa học trường slug = giá trị req.params.slug
            const post = await Post.findOne({
                slug: req.params.slug,
            }).lean()
            console.log(post)
            res.render('admin/posts/details', { post })
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new PostController()
