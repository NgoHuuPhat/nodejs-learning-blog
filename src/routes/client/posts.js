var express = require('express')
var router = express.Router()
const postController = require('../../app/controllers/client/PostController')
const upload = require('../../config/multer')
const uploadCloudinary  = require('../../app/middlewares/uploadCloudinary')

router.get('/create', postController.create)
router.post('/store', upload.single('thumbnail'), uploadCloudinary, postController.store)
router.get('/:id/edit', postController.edit)
router.patch('/:id', upload.single('thumbnail'), uploadCloudinary, postController.update)
router.delete('/:id', postController.destroy)
router.post('/:id/request-delete', postController.requestDelete) 
router.get('/:slug', postController.details)

module.exports = router
