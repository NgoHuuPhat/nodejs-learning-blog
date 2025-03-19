var express = require('express')
var router = express.Router()
const AccountController = require('../../app/controllers/admin/AccountController')

router.get('/', AccountController.index)
router.get('/create', AccountController.create)
router.post('/store', AccountController.store)
router.get('/:id/edit', AccountController.edit)
router.patch('/:id', AccountController.update) 



module.exports = router
