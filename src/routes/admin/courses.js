var express = require('express')
var router = express.Router()
const courseController = require('../../app/controllers/admin/CourseController')

router.get('/', courseController.index)
router.get('/create', courseController.create)
router.post('/store', courseController.store)
router.patch('/:id', courseController.update)
router.get('/trash', courseController.trashCourses)
router.get('/:id/edit', courseController.edit)
router.post('/handle-form-actions', courseController.handleFormActions) //Xử lý select tất cả
router.patch('/:id/restore', courseController.restore) //Khôi phục
router.delete('/:id', courseController.destroy) //Xóa mềm
router.delete('/:id/force', courseController.forceDestroy) //Xóa vĩnh viễn

module.exports = router
