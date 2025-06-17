var express = require('express')
var router = express.Router()
const courseController = require('../../app/controllers/admin/CourseController')
const upload = require('../../app/middlewares/multer')
const uploadCloudinary  = require('../../app/middlewares/uploadCloudinary')

router.get('/', courseController.index)
router.get('/create', courseController.create)
router.post('/store',
    upload.fields([
        { name: 'courseImage', maxCount: 1 },
        { name: 'courseVideoPreview', maxCount: 1 },
        { name: 'courseVideoLesson' } 
    ]),
    uploadCloudinary, 
    courseController.store)
router.patch('/:id',
    upload.fields([
    { name: 'courseImage', maxCount: 1 },
    { name: 'courseVideoPreview', maxCount: 1 },
    { name: 'courseVideoLesson' } 
    ]),
    uploadCloudinary, 
    courseController.update)
router.get('/trash', courseController.trashCourses)
router.get('/:id/edit', courseController.edit)
router.post('/handle-form-actions', courseController.handleFormActions) //Xử lý select tất cả
router.patch('/:id/restore', courseController.restore) //Khôi phục
router.delete('/:id', courseController.destroy) //Xóa mềm
router.delete('/:id/force', courseController.forceDestroy) //Xóa vĩnh viễn

module.exports = router

