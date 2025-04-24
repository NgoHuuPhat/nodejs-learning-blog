var express = require('express')
var router = express.Router()
const commentController = require('../../app/controllers/admin/CommentController')

router.get('/', commentController.index)
router.get('/trash', commentController.trashComments)
router.post('/handle-form-actions', commentController.handleFormActions) 
router.patch('/:id/restore', commentController.restore) 
router.delete('/:id', commentController.destroy)
router.delete('/:id/force', commentController.forceDestroy) 
router.delete('/:commentId/replies/:replyId', commentController.destroyReplies)
router.patch('/:commentId/replies/:replyId/restore', commentController.restoreReplies) 




module.exports = router
