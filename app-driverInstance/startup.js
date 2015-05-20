/**
 * Created by Shawn Liu on 15-5-15.
 */
var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("app-drverInstance/startup.js");
var seleniumServer = require("./selenium/index");
var phantomInstance = require("./phantom/index");
var listenerConfig = require("config").listener.driverInstanceApp;

exports.setupCrawlerServer = function () {
    var hubPort = listenerConfig.seleniumHub;
    return seleniumServer.createHub(hubPort)
        .then(function () {
            return Promise.map(listenerConfig.seleniumServer, function (port) {
                return seleniumServer.registerSeleniumNode(hubPort, port);
            })
        })
        .then(function () {
            return Promise.map(listenerConfig.phantomCluster, function (port) {
                return phantomInstance.registerPhantomNode(hubPort, port)
            });
        })
        .catch(function (err) {
            logger.error(err);
        })
}

//exports.setupCrawlerServer();