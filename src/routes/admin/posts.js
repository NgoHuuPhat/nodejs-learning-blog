var express = require('express')
var router = express.Router()
const postController = require('../../app/controllers/admin/PostController')

router.get('/', postController.index)
router.get('/:slug', postController.details)
router.patch('/:id', postController.update)
// router.get('/create', postController.create)
// router.post('/store', postController.store)
// router.patch('/:id', postController.update)
// router.get('/trash', postController.trashCourses)
// router.get('/:id/edit', postController.edit)
// router.post('/handle-form-actions', postController.handleFormActions) //Xử lý select tất cả
// router.patch('/:id/restore', postController.restore) //Khôi phục
router.delete('/:id', postController.destroy) //Xóa mềm
// router.delete('/:id/force', postController.forceDestroy) //Xóa vĩnh viễn

module.exports = router
