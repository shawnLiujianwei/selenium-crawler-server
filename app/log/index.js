/**
 * Created by Shawn Liu on 2015/5/18.
 */
var express = require('express');
var controller = require('./log.controller');
var router = express.Router();
router.get("/summary",controller.summary);
router.get("/clean",controller.clean);
module.exports = router;