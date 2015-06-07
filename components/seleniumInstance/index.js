/**
 * Created by Shawn Liu on 15-6-7.
 */
var SeleniumHunInstance = require("./SeleniumHubInstance");
var seleniumInstance = new SeleniumHunInstance();
var config = require("config").seleniumHub;
var Promise = require("bluebird");


exports.start = function () {
    return seleniumInstance.start(config.port)
        .then(function () {
            console.error(seleniumInstance.port);
            return Promise.map(config.phantom, function (port) {
                return seleniumInstance.registerNode(port, "phantomjs")
            })
        })
        .then(function () {
            return Promise.map(config.chrome, function (port) {
                return seleniumInstance.registerNode(port, "chrome");
            })
        })
        .then(function () {
            return seleniumInstance;
        })
}

exports.get = function () {
    seleniumInstance.port = config.port;
    return seleniumInstance;
}