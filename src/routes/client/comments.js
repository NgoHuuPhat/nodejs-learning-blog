var express = require('express')
var router = express.Router()
const commentController = require('../../app/controllers/client/CommentController')

router.post('/:id', commentController.create)
// router.get('/:id/edit', courseController.edit)
// router.post('/handle-form-actions', courseController.handleFormActions)
// router.put('/:id', courseController.update)
// router.patch('/:id/restore', courseController.restore)
// router.delete('/:id', courseController.destroy)
// router.delete('/:id/force', courseController.forceDestroy)
// router.get('/:slug', courseController.details)

module.exports = router
