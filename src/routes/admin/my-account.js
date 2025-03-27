var express = require('express')
var router = express.Router()
const MyAccountController = require('../../app/controllers/admin/MyAccountController')
const upload = require('../../config/multer');

router.get('/', MyAccountController.index)
router.get('/:id/edit', MyAccountController.edit)
router.patch('/:id',upload.single('avatar'), MyAccountController.update) 

module.exports = router
