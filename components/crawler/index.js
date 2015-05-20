/**
 * Created by Shawn Liu on 15-5-15.
 */

var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;
var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("components/crawler/index.js");
var crawlerExecutor = require("./executor");
var seleniumServer = require("../selenium");
var phantomInstance = require("../phantom");
var listenerConfig = require("config").listener;
exports.priceSpider = function (productURL, locale, site, browser) {
    return exports.getAvailablePort()
        .then(function (port) {
            return crawlerExecutor.priceSpider(productURL, locale, site, port, browser);
        })
}
var phantomInstances = listenerConfig.phantomCluster;
var lastPick = 0;
exports.getAvailablePort = function () {
    for (var i = 0; i < phantomInstances.length; i++) {
        var instance = phantomInstances[lastPick++ % phantomInstances.length];
        return Promise.resolve(instance);
    }
    return Promise.reject("All queues are full");
}

exports.setupCrawlerServer = function () {
    var hubPort = listenerConfig.seleniumHub;
    return seleniumServer.createHub(hubPort)
        .then(function () {
            return Promise.map(listenerConfig.seleniumServer, function (port) {
                return seleniumServer.registerSeleniumNode(hubPort, port);
            })
        })
        .then(function () {
            return Promise.map(phantomInstances, function (port) {
                return phantomInstance.registerPhantomNode(hubPort, port)
                    .then(function () {
                        phantomInstances.push(port);
                    })
            });
        })
        .catch(function (err) {
            logger.error(err);
        })
}