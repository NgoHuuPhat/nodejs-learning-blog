const Course = require('../../models/Course')
const Account = require('../../models/Account')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const PostDeleteRequest = require('../../models/PostDeleteRequest')

class CommentController {

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
                    { $push: { replies: {user_id: res.locals.account.id, content: req.body.replies, replyToUserId: req.body.replyToUserId} } }
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
                    { $set: { 'replies.$.content': req.body.editReplies } } //.$. là toán tử để cập nhật trường con trong mảng
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
                    await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: -1 } })

                    // Gán giá trị vào req.session
                    req.session.deletedComment = comment._id
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

            }
            res.redirect(req.get('referer') + '?showComments=true')
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new CommentController()
