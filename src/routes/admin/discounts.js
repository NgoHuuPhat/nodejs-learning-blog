var express = require('express')
var router = express.Router()
const discountController = require('../../app/controllers/admin/DiscountController')

router.get('/', discountController.index)
router.get('/create', discountController.create)
router.post('/store', discountController.store)
router.get('/trash', discountController.trashCourses)
router.get('/:id/edit', discountController.edit)
router.patch('/:id', discountController.update)
router.post('/handle-form-actions', discountController.handleFormActions)
router.delete('/:id', discountController.destroy)
router.patch('/:id/restore', discountController.restore)
router.delete('/:id/force', discountController.forceDelete)

module.exports = router

