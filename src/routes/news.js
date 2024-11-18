var express = require('express');
var router = express.Router();
const newController = require('../app/controller/NewController');

router.get('/:slug', newController.show);
router.get('/', newController.index);

module.exports = router;
