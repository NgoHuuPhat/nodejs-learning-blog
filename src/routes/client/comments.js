var express = require('express')
var router = express.Router()
const commentController = require('../../app/controllers/client/CommentController')

router.post('/:id', commentController.create)
router.post('/:id/reply', commentController.replyComment)
router.put('/:id', commentController.updateComment)
router.put('/:commentId/replies/:replyId', commentController.updateCommentReply)
router.delete('/:id', commentController.destroy) //Xóa mềm

module.exports = router
