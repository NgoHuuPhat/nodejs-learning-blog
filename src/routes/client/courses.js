var express = require('express')
var router = express.Router()
const courseController = require('../../app/controllers/client/CourseController')

router.get('/:slug/apply-discount', courseController.applyDiscount)
router.get('/:slug', courseController.details)

module.exports = router
