var express = require('express')
var router = express.Router()
const meController = require('../../app/controllers/client/MeController')

router.get('/stored/courses', meController.storedCourses)
router.get('/trash/courses', meController.trashCourses)
router.get('/my-profile', meController.myProfileRoute)
router.get('/list-post', meController.myPostsRoute)


module.exports = router
