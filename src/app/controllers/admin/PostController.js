const Post = require('../../models/Post')
const Account = require('../../models/Account')
const PostDeleteRequest = require('../../models/PostDeleteRequest')
const paginatitonHelper = require('../../../helpers/pagination')
const dateTime = require('../../../helpers/dateTime')

class PostController {
    //[GET] /admin/posts
    async index(req, res, next) {
        try {
            //Đếm số lượng khóa học
            const countPosts = await Post.countDocuments({ deleted: false })
            const countDeleteRequests = await PostDeleteRequest.countDocuments()

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
                countDeleteRequests,
            })
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

            //Lây ra tên người tạo
            for (let post of posts) {
                const user = await Account.findOne({
                    _id: post.author,
                }).lean()

                if (user) {
                    post.author = user.fullName
                }

            // Lấy ra người xóa
                const deletedUser = await Account.findOne({
                    _id: post.deletedBy.account_id,
                }).lean()
                if (deletedUser) {
                    post.deletedBy = deletedUser.fullName
                }

                // Chuyển đổi createdAt sang định dạng DD/MM/YYYY
                post.createdAt = dateTime(post.createdAt)
            }

            res.render('admin/posts/trash-posts', { posts })
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/posts/:id
    async updateStatus(req, res, next) {
        try {

            //Nếu tồn tại trạng thái mới thì cập nhật trạng thái
            if(req.query.newstatus){
                await Post.updateOne(
                    { _id: req.params.id },
                    {
                        status: req.query.newstatus
                    },
                )
            }
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

            // Xóa yêu cầu xóa bài viết
            const postDeleteRequest = await PostDeleteRequest.findOne({
                post_id: req.params.id,
            }).lean()
            if (postDeleteRequest) {
                await PostDeleteRequest.deleteOne({
                    post_id: req.params.id,
                })
            }

            //Chính thức xóa mềm
            await Post.delete({ _id: req.params.id })
            req.flash('success', 'Đã chuyển bài viết vào thùng rác')
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] /admin/posts/:id/restore
    async restore(req, res, next) {
        try {
            await Post.restore({ _id: req.params.id })
            req.flash('success', 'Khôi phục thành công')
            res.redirect('back')
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
                    await Post.delete({ _id: req.body.postIDs })
                    res.redirect('back')
                } catch (error) {
                    next(error)
                }
                break
            case 'approved':
                try {
                    await Post.updateMany(
                        { _id: req.body.postIDs },
                        {
                            status: req.body.action,
                        },
                    )
                    res.redirect('back')
                } catch (error) {
                    next(error)
                }
                break
            case 'rejected':
                try {
                    await Post.updateMany(
                        { _id: req.body.postIDs },
                        {
                            status: req.body.action,
                        },
                    )
                    res.redirect('back')
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
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[GET] /posts/:slug
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

    
    //[GET] /admin/posts/request-delete
    async requestDeletePosts(req, res, next) {
        try {

            const posts = await PostDeleteRequest.find({}).lean()
            
            // Lấy ra chi tiết bài viết
            for(const post of posts) {
                const postDetails = await Post.findOne({ _id: post.post_id }).lean()
                const accountDetails = await Account.findOne({ _id: post.user_id }).lean()
                if (postDetails) {
                    post.postDetails = postDetails
                    post.accountDetails = accountDetails
                    post.postDetails.createdAt = dateTime(post.postDetails.createdAt)
                }
            }

            res.render('admin/posts/request-delete', { posts })

        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/posts/:id/deny
    async denyDeleteRequest(req, res, next) {
        try {
            await PostDeleteRequest.deleteOne({ _id: req.params.id })
            req.flash('success', 'Đã từ chối yêu cầu xóa bài viết')
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }
}

module.exports = new PostController()
