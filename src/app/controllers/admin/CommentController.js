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
                Comment.countDocumentsWithDeleted({ deleted: true }),
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
                    comment.postTitle = post.title
                }

                comment.createdAt = dateTime(comment.createdAt)
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
            const comments = await Comment.findWithDeleted({
                deleted: true,
            }).lean()

            //Lây ra tên người bình luận và bài viết
            for (let comment of comments) {
                const user = await Account.findOne({
                    _id: comment.user_id,
                }).lean()

                if (user) {
                    comment.userName = user.fullName
                }
                const post = await Post.findOne({
                    _id: comment.post_id,
                }).lean()
                if (post) {
                    comment.postTitle = post.title
                }

                // Chuyển đổi createdAt sang định dạng DD/MM/YYYY
                comment.createdAt = dateTime(comment.createdAt)
                
            }

            res.render('admin/comments/trash-comments', { comments })
        } catch (error) {
            next(error)
        }
    }
    

}

module.exports = new CommentController()
