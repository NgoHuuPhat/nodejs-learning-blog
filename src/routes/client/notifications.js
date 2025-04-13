var express = require('express')
var router = express.Router()
const notificationController = require('../../app/controllers/client/NotificationController')

router.patch('/:id/read', notificationController.isRead)
router.patch('/readAll', notificationController.readAll)
// router.post('/store', notificationController.store)
// router.get('/:id/edit', notificationController.edit)
// router.post('/handle-form-actions', notificationController.handleFormActions)
// router.put('/:id', notificationController.update)
// router.patch('/:id/restore', notificationController.restore)
// router.delete('/:id', notificationController.destroy)
// router.delete('/:id/force', notificationController.forceDestroy)
// router.get('/:slug', notificationController.details)

module.exports = router
