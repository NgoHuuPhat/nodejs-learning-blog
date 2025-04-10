var express = require('express')
var router = express.Router()
const postController = require('../../app/controllers/admin/PostController')

router.get('/', postController.index)
router.get('/trash', postController.trashPosts)
router.patch('/:id', postController.updateStatus)
router.post('/handle-form-actions', postController.handleFormActions) //Xử lý select tất cả
router.patch('/:id/restore', postController.restore) //Khôi phục
router.delete('/:id', postController.destroy) //Xóa mềm
router.delete('/:id/force', postController.forceDestroy) //Xóa vĩnh viễn
router.get('/request-delete', postController.requestDeletePosts)
router.get('/:slug', postController.details)


module.exports = router