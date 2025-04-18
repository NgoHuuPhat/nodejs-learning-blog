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
            console.log("Req.body: ", req.body);
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
    async update(req, res, next) {
        try {
            if (req.params.id && res.locals.account.id) {
                await Comment.updateOne(
                    { _id: req.params.id, user_id: res.locals.account.id },
                    { content: req.body.content }
                )
                req.flash('success', 'Cập nhật bình luận thành công!')
            } else {
                req.flash('error', 'Không thể cập nhật bình luận!')
            }
            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

    //[DELETE] /comments/:id
    async destroy(req, res, next) {
        try {
            const comment = await Comment.findOneAndDelete({
                _id: req.params.id,
                user_id: res.locals.account.id,
            })

            if (comment) {
                // Giảm số lượng bình luận của bài viết
                await Post.updateOne({ _id: comment.post_id }, { $inc: { commentCount: -1 } })
                req.flash('success', 'Xóa bình luận thành công!')
            } else {
                req.flash('error', 'Không thể xóa bình luận!')
            }

            res.redirect('back')
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new CommentController()
