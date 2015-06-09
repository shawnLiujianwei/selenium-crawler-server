/**
 * Created by Shawn Liu on 2015/5/20.
 */
var phantomInstancePorts = require("config").phantom;
var Promise = require("bluebird");
var host = "http://127.0.0.1";
var BatchRequest = require("./BatchRequest");
var CrawlerInstance = require("./CrawlerInstance");
var lastPick = 0;
var phantomInstances = [];
exports.getAvailableInstance = function (browser) {
    return Promise.resolve(phantomInstances[lastPick++ % phantomInstances.length])
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
    phantomInstancePorts.forEach(function (port) {
        phantomInstances.push(new CrawlerInstance(host + ":" + port, "phantomjs", port));
    });
}
