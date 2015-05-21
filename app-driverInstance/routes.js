/**
 * Main application routes
 */

'use strict';
//var express = require("express");
//var router = express.Router();
var phantom = require("./phantom");
var selenium = require("./selenium");
var listenerConfig = require("config").listener.driverInstanceApp;
var logger = require("node-config-logger").getLogger("app-driverInstance/routes.js");
module.exports = function (app) {
    //app.use("/scrape", require("./app/scrape/index"));
    ////app.use("/api/log", require("./app/log"));
    app.get("/driver/restart/phantomjs/:port", function (req, res) {
        var port = req.params.port;
        phantom.registerPhantomNode(listenerConfig.seleniumHub, parseInt(port))
            .then(function () {
                logger.warn("refresh phantom instance on port '%s'", port);
                res.json("restart phantom instance on port " + port);
            })
            .catch(function (err) {
                logger.error(err);
            })
    });
    app.get("/driver/restart/selenium/:port", function (req, res) {
        var port = req.params.port;
        selenium.registerSeleniumNode(listenerConfig.seleniumHub, parseInt(port))
            .then(function () {
                logger.warn("refresh selenium instance on port '%s'", port);
                res.json("restart selenium instance on port " + port);
            })
            .catch(function (err) {
                logger.error(err);
            })
    });
};
