var express = require('express')
var router = express.Router()
const commentController = require('../../app/controllers/admin/CommentController')

router.get('/', commentController.index)
router.get('/trash', commentController.trashComments)
router.post('/handle-form-actions', commentController.handleFormActions) //Xử lý select tất cả
router.patch('/:id/restore', commentController.restore) //Khôi phục
router.delete('/:id', commentController.destroy) //Xóa mềm
router.delete('/:id/force', commentController.forceDestroy) //Xóa vĩnh viễn


module.exports = router
