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

// Upload image for TinyMCE to Cloudinary
router.post('/upload/tinymce', upload.single('tinyMCE'), uploadCloudinary, (req, res) => {
    if(req.file){
        const imageUrl = req.file.cloudinary_url 
        res.json({ url: imageUrl })
    }
    else {
        res.status(400).json({ error: 'No file uploaded' })
    }

})

module.exports = router
