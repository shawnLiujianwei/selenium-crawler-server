/**
 * Created by Shawn Liu on 2015/5/20.
 */
var listenerConfig = require("config").listener.driverInstanceApp;
var Promise = require("bluebird");
var host = "http://127.0.0.1";
var BatchRequest = require("./BatchRequest");
var phantomInstances = [];
var seleniumInstances = [];
var CrawlerInstance = require("./CrawlerInstance");
var lastPhantomPick = 0;
var lastSeleniumPick = 0;
exports.getAvailableInstance = function (browser) {
    if (browser === "phantomjs") {
        var instance = phantomInstances[lastPhantomPick++ % phantomInstances.length];
        return Promise.resolve(instance);
    } else {
        var instance = seleniumInstances[lastSeleniumPick++ % seleniumInstances.length];
        return Promise.resolve(instance);
    }
}

exports.scrape = function (crawlerType, urls, locale, retailer, browser) {
    var batchRequest = new BatchRequest({
        "productURLs": urls,
        "method": crawlerType,
        "locale": locale,
        "retailer": retailer,
        "browser": browser || "phantomjs"
    });
    return batchRequest.process()
        .then(function (result) {
            return result
        })
        .catch(function (err) {
            return {
                status: false,
                message: err.message || err
            };
        })
}

exports.initAllInstance = function () {
    var host = "http://127.0.0.1";
    listenerConfig.seleniumServer.forEach(function (port) {
        seleniumInstances.push(new CrawlerInstance(host + ":" + listenerConfig.seleniumHub + "/wd/hub", "selenium", port));
    })
    listenerConfig.phantomCluster.forEach(function (port) {
        phantomInstances.push(new CrawlerInstance(host + ":" + port, "phantomjs", port));
    })
}
