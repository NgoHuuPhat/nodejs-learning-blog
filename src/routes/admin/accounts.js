var express = require('express')
var router = express.Router()
const AccountController = require('../../app/controllers/admin/AccountController')
const upload = require('../../config/multer');

router.get('/', AccountController.index)
router.get('/create', AccountController.create)
router.post('/store',upload.single('avatar'), AccountController.store)
router.get('/:id/edit', AccountController.edit)
router.patch('/:id',upload.single('avatar'), AccountController.update) 
router.delete('/:id', AccountController.delete)

module.exports = router
