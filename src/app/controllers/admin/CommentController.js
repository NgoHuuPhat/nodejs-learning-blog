const Post = require('../../models/Post')
const Account = require('../../models/Account')
const Comment = require('../../models/Comment')
const Notification = require('../../models/Notification')
const PostDeleteRequest = require('../../models/PostDeleteRequest')
const paginatitonHelper = require('../../../helpers/pagination')
const dateTime = require('../../../helpers/dateTime')


class CommentController {
    //[GET] /admin/comments
    async index(req, res, next) {
        try {
            //Đếm số lượng bình luận
            const countComments = await Comment.countDocuments({ deleted: false })

            let objectPagination = paginatitonHelper(
                {
                    limitItems: 5,
                    currentPage: 1,
                },
                req.query,
                countComments,
            )

            //Dùng destructuring
            const [comments, countDeleted] = await Promise.all([
                Comment.find({ deleted: false })
                    .sortTable(req)
                    .skip(objectPagination.skip)
                    .limit(objectPagination.limitItems)
                    .lean(),
                Comment.countDocumentsWithDeleted({ 
                    $or: [
                        { deleted: true },
                        { 'replies.deleted': true },
                    ],
                 }),
            ])

            //Lấy ra tên người tạo và bài viết 
            for(const comment of comments) {
                const user = await Account.findOne({
                    _id: comment.user_id,
                }).lean()
                const post = await Post.findOne({
                    _id: comment.post_id,
                }).lean()

                if(user) {
                    comment.userName = user.fullName
                }
                if(post) {
                    comment.slug = post.slug
                    comment.postTitle = post.title
                }

                comment.lengthReplies = comment.replies.filter((reply)=> reply.deleted === false).length
                comment.createdAt = dateTime(comment.createdAt)

                // Xử lí phần reply
                if(comment.replies && comment.replies.length > 0) {
                    for(const reply of comment.replies) {
                        const userReply = await Account.findOne({
                            _id: reply.user_id,
                        }).lean()
                        if(userReply) {
                            reply.userName = userReply.fullName
                        }
                        reply.createdAt = dateTime(reply.createdAt)
                    }
                }

            }

            res.render('admin/comments/list', {
                comments,
                countDeleted,
                objectPagination,
                query: req.query,
            })
        } catch (error) {
            next(error)
        }
    }

    //[GET] /admin/comments/trash
    async trashComments(req, res, next) {
        try {
            // Lấy ra bình luận đã xóa
            const deletedComments = await Comment.findWithDeleted({deleted: true})
            
            // Thêm type và lấy nội dung cho từng bình luận
            const deletedCommentsWithDetails = await Promise.all(deletedComments.map(async (comment) => {
                const formattedComment = {
                    ...comment.toObject(),
                    createdAt: dateTime(comment.createdAt),
                    type: 'comment',
                }
                const user = await Account.findOne({
                    _id: comment.user_id,
                }).lean()
                const post = await Post.findOne({
                    _id: comment.post_id,
                }).lean()
                if(user) {
                    formattedComment.userName = user.fullName
                }
                if(post) {
                    formattedComment.slug = post.slug
                    formattedComment.postTitle = post.title
                }

                const deletedByInfo = await Account.findById(comment.deletedBy.account_id).lean()
                if(deletedByInfo) {
                    formattedComment.deletedByName = deletedByInfo.fullName
                }

                formattedComment.deletedAt = dateTime(comment.deletedBy.deletedAt)
                
                return formattedComment
            }))

            
            // Lấy ra reply đã xóa nhưng chưa xóa comment
            const rawComments = await Comment.find({
                deleted: false,
                'replies.deleted': true
            });
            const deletedReplies = [];
            // Thêm type và lấy nội dung cho từng reply
            for (const comment of rawComments) {
                for (const reply of comment.replies) {

                    // Nếu reply chưa bị xóa thì bỏ qua
                    if (!reply.deleted) continue;

                    // tìm user
                    const user = await Account.findById(reply.user_id).lean();

                    // tìm bài viết
                    const post = await Post.findOne({_id: comment.post_id}).lean()

                    // tìm người xóa
                    const deletedByInfo = await Account.findById(reply.deletedBy.account_id).lean()
                   
                    deletedReplies.push({
                        type: 'reply',
                        commentId: comment._id,
                        replyId: reply._id,
                        content: reply.content,
                        createdAt: dateTime(reply.createdAt),
                        deletedAt: dateTime(reply.deletedBy.deletedAt),
                        userName: user?.fullName,
                        postTitle: post.title,
                        deletedByName: deletedByInfo?.fullName 
                    });
                    
                }
            }

            // 4. Gộp lại
            const comments = [...deletedCommentsWithDetails, ...deletedReplies];   
            console.log(comments)
            
            res.render('admin/comments/trash-comments', {comments})
        } catch (error) {
            next(error)
        }
    }
    
    //[PATCH] /admin/comments/:id/restore
    async restore(req, res, next) {
        try {

            // Khôi phục bình luận
            await Comment.restore({ _id: req.params.id })

            // Tăng số lượng bình luận của bài viết
            const comment = await Comment.findById(req.params.id).lean()

            await Post.updateOne(
                { _id: comment.post_id },
                { $inc: { commentCount: 1 } },
            )

            req.flash('success', 'Khôi phục thành công')
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/comments/:id //Xóa mềm
    async destroy(req, res, next) {
        try {
            const commentId = req.params.id
            const deletedByInfo = {
                account_id: res.locals.account.id,
                deletedAt: new Date(),
            }

            // Tìm comment cần xóa
            await Comment.updateOne(
                { _id: req.params.id },
                {
                    deletedBy: deletedByInfo,
                },
            )

            // Giảm số lượng bình luận của bài viết
            const comment = await Comment.findById(req.params.id).lean()
            if (comment) {
                
                // Đếm số lượng reply chưa bị xóa trước đó
                const activeRepliesCount = comment.replies.filter(
                    (reply) => reply.deleted === false,
                ).length

                await Post.updateOne(
                    { _id: comment.post_id },
                    { $inc: { commentCount: -( activeRepliesCount + 1) } },
                )
            }

            // Cập nhật lại replies
            await Comment.updateMany(
                { _id: req.params.id, 'replies.deleted': false },
                {
                    $set: { 
                        'replies.$[].deleted': true,
                        'replies.$[].deletedBy': deletedByInfo
                    },
                },
            )

            //Chính thức xóa mềm
            await Comment.delete({ _id: req.params.id })
            req.flash('success', 'Đã chuyển bài viết vào thùng rác')
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[POST] /admin/posts/handle-form-actions
    async handleFormActions(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                try {
                    // Xóa mềm lưu thông tin người xóa
                    await Comment.updateMany(
                        { _id: req.body.commentIDs },
                        {
                            deletedBy: {
                                account_id: res.locals.account.id,
                                deletedAt: new Date(),
                            },
                        },
                    )
                    // Giảm số lượng bình luận của bài viết
                    const comments = await Comment.find({
                        _id: req.body.commentIDs,
                    }).lean()
                    for (const comment of comments) {
                        await Post.updateOne(
                            { _id: comment.post_id },
                            { $inc: { commentCount: -1 } },
                        )
                    }
                    // Chính thức xóa mềm
                    await Comment.delete({ _id: req.body.commentIDs })
                    res.redirect('back')
                } catch (error) {
                    next(error)
                }
                break
            default:
                res.json({ message: 'Action in valid' })
        }
    }

    //[DELETE] /admin/comments/:id/force
    async forceDestroy(req, res, next) {
        try {
            await Comment.deleteOne({ _id: req.params.id })
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /admin/comments/:commentId/replies/:replyId
    async destroyReplies(req, res, next) {
        try {
            if(req.params.replyId && req.params.commentId) {
                await Comment.updateOne(
                    { _id: req.params.commentId, 'replies._id': req.params.replyId },
                    { $set:
                        { 
                            'replies.$.deleted': true,
                            'replies.$.deletedAt': new Date(),
                            'replies.$.deletedBy': {
                                account_id: res.locals.account.id,
                                deletedAt: new Date(),
                            },
                        } 
                    } //.$. là toán tử để cập nhật trường con trong mảng
                )

                // Giảm số lượng bình luận của bài viết
                const comment = await Comment.findOne({ _id: req.params.commentId, deleted: true})
                if(comment) {
                    await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: -1 } })
                }
            }

            res.redirect('back')
            } catch (error) {
                next(error)
            }
    }

    //[PATCH] /:commentId/replies/:replyId/restore
    async restoreReplies(req, res, next) {
        try {
            if(req.params.replyId && req.params.commentId) {
                await Comment.updateOne(
                    { _id: req.params.commentId, 'replies._id': req.params.replyId },
                    { $set:
                        { 
                            'replies.$.deleted': false,
                            'replies.$.deletedBy': {
                                account_id: null,
                                deletedAt: null,
                            },
                        } 
                    } //.$. là toán tử để cập nhật trường con trong mảng
                )

                // Tăng số lượng bình luận của bài viết
                const comment = await Comment.findOne({ _id: req.params.commentId, deleted: false})
                if(comment) {
                    await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: 1 } })
                }
            }
            req.flash('success', 'Khôi phục thành công')
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new CommentController()
