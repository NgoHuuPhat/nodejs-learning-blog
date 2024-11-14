var express = require('express');
var router = express.Router();
const newController = require('../app/controller/NewController');
const siteController = require('../app/controller/SiteController');

router.use('/search', siteController.search);
router.use('/', siteController.home);

module.exports = router;
