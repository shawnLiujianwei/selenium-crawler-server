/**
 * Created by Shawn Liu on 15-6-11.
 */
var express = require('express');
var controller = require('./selector.controller.js');
var router = express.Router();
router.get("/locale/:locale/retailer/:retailer", controller.query);
router.get("/locale/:locale", controller.query);
router.get("/template", controller.template);
router.get("/id/:id", controller.getById);
router.post("/", controller.upsert);
router.delete("/", controller.disableRetailer);
router.get("/", controller.query)
module.exports = router;