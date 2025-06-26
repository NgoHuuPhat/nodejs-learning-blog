var express = require('express')
var router = express.Router()
const learningController = require('../../app/controllers/client/LearningController')

router.get('/:slug', learningController.learning)

module.exports = router
