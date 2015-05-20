/**
 * Created by Shawn Liu on 2015/5/18.
 */
var express = require('express');
var controller = require('./scrape.controller.js');
var router = express.Router();
router.post("/price", controller.scrape);
router.get("/test", controller.test);
module.exports = router;