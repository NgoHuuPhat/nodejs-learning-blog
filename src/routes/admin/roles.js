var express = require('express')
var router = express.Router()
const RoleController = require('../../app/controllers/admin/RoleController')

router.get('/', RoleController.listRoles)
router.get('/create', RoleController.create)
router.post('/store', RoleController.store)
router.get('/:id/edit', RoleController.edit)
router.patch('/permissions', RoleController.permissionsPatch)
router.patch('/:id', RoleController.update) //Cập nhật 1 phần giá trị
router.delete('/:id', RoleController.delete)
router.get('/permissions', RoleController.permissions)


module.exports = router
