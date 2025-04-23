const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const PostDeleteRequest = require('../../models/PostDeleteRequest')

class CommentController {

    //[POST] /comments/:id
    async create(req, res, next) {
        try {
            if(req.params.id && res.locals.account.id && req.body) {
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

            if(req.body && req.params.id && res.locals.account.id) {
                await Comment.updateOne(
                    { _id: req.params.id },
                    { $push: { replies: {user_id: res.locals.account.id, content: req.body.replies, replyToUserId: req.body.replyToUserId, createdAt: new Date()} } }
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


    //[PUT] /comments/:id
    async updateComment(req, res, next) {
        try {
            if (req.params.id && req.body) {
                await Comment.updateOne(
                    { _id: req.params.id },
                    { content: req.body.editContent }
                )
            } 

            res.redirect(req.get('referer') + '?showComments=true')
        } catch (error) {
            next(error)
        }
    }

    //[PUT] /comments/:commentId/replies/:replyId
    async updateCommentReply(req, res, next) {
        try {
            if(req.params.replyId && req.params.commentId && req.body) {
                await Comment.updateOne(
                    { _id: req.params.commentId, 'replies._id': req.params.replyId },
                    { $set: 
                        { 
                            'replies.$.content': req.body.editReplies, 
                            'replies.$.updatedAt': new Date(),
                        } 
                    } //.$. là toán tử để cập nhật trường con trong mảng
                )
            }

            res.redirect(req.get('referer') + '?showComments=true')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /comments/:id
    async destroy(req, res, next) {
        try {
            if (req.params.id) {

                // Giảm số lượng bình luận của bài viết
                const comment = await Comment.findOne({ _id: req.params.id, deleted: true })
                if(comment) {

                    // Xóa mềm bình luận
                    await Comment.updateOne(
                        { _id: req.params.id },
                        {
                            deletedBy: {
                                account_id: res.locals.account.id,
                                deletedAt: new Date(),
                            },
                        })

                    // Cập nhật số lượng bình luận của bài viết
                    await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: -1 } })

                    // Lưu giá trị session để khôi phục lại bình luận
                    req.session.deletedComment = req.session.deletedComment || []
                    req.session.deletedComment.push({
                        id: comment._id,
                        deletedAt: Date.now(),
                    })
                    
                }

                await Comment.delete({ _id: req.params.id })

            }
            res.redirect(req.get('referer') + '?showComments=true')
        } catch (error) {
            next(error)
        }
    }

    //[PATCH] comments/:id/restore
    async restore(req, res, next) {
        try {
            if(req.params.id){

                await Comment.restore({ _id: req.params.id })

                // Tăng số lượng bình luận của bài viết
                const comment = await Comment.findOne({ _id: req.params.id, deleted: false })
                if(comment) {
                    await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: 1 } })
                }

                // Xóa giá trị session đã lưu khi khôi phục bình luận
                if(req.session.deletedComment && req.session.deletedComment.length > 0) {
                    req.session.deletedComment = req.session.deletedComment.filter(item => item.id !== req.params.id)
                }

            }
            res.redirect(req.get('referer') + '?showComments=true')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /comments/:commentId/replies/:replyId
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

                // Lưu giá trị session để khôi phục lại reply
                req.session.deletedReply = req.session.deletedReply || []
                req.session.deletedReply.push({
                    id: req.params.replyId,
                    deletedAt: Date.now(),
                })

                // Giảm số lượng bình luận của bài viết
                const comment = await Comment.findOne({ _id: req.params.commentId, deleted: true})
                if(comment) {
                    await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: -1 } })
                }
            }

            res.redirect(req.get('referer') + '?showComments=true')
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

                // Xóa giá trị session đã lưu khi khôi phục bình luận
                if(req.session.deletedReply && req.session.deletedReply.length > 0) {
                    req.session.deletedReply = req.session.deletedReply.filter(item => item.id !== req.params.replyId)
                }

                // Tăng số lượng bình luận của bài viết
                const comment = await Comment.findOne({ _id: req.params.commentId, deleted: false})
                if(comment) {
                    await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: 1 } })
                }
            }
            res.redirect(req.get('referer') + '?showComments=true')
        } catch (error) {
            next(error)
        }
    }
    

}

module.exports = new CommentController()
