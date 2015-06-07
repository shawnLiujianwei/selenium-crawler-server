/**
 * Created by Shawn Liu on 2015/5/20.
 */
var seleniumHubConfig = require("config").seleniumHub;
var Promise = require("bluebird");
var host = "http://127.0.0.1";
var BatchRequest = require("./BatchRequest");
var phantomInstances = [];
var seleniumInstances = [];
var CrawlerInstance = require("./CrawlerInstance");
var lastPick = 0;
var crawlerInstances = [];
exports.getAvailableInstance = function (browser) {
    return Promise.resolve(crawlerInstances[lastPick++ % crawlerInstances.length])
    //if (browser === "phantomjs") {
    //    var instance = phantomInstances[lastPhantomPick++ % phantomInstances.length];
    //    return Promise.resolve(instance);
    //} else {
    //    var instance = seleniumInstances[lastSeleniumPick++ % seleniumInstances.length];
    //    return Promise.resolve(instance);
    //}
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
    //var server = "http://127.0.0.1:" + seleniumHubConfig.port + "/wd/hub";
    //crawlerInstances.push(new CrawlerInstance(
    //    server,"seleniumHub",
    //))
    //crawlerInstances.push(new CrawlerInstance(server + "- Hub:" + seleniumHubConfig.port));
    //seleniumHubConfig.chrome.forEach(function (port) {
    //    crawlerInstances.push(new CrawlerInstance(server + " - Node:" + port, "chrome", seleniumHubConfig.port));
    //})
    //seleniumHubConfig.phantom.forEach(function (port) {
    //    crawlerInstances.push(new CrawlerInstance(server + "- Node:" + port, "phantomjs", seleniumHubConfig.port));
    //})

    var host = "http://127.0.0.1";
    //seleniumHubConfig.seleniumServer.forEach(function (port) {
    //    seleniumInstances.push(new CrawlerInstance(host + ":" + seleniumHubConfig.seleniumHub + "/wd/hub", "selenium", port));
    //})
    seleniumHubConfig.phantom.forEach(function (port) {
        crawlerInstances.push(new CrawlerInstance(host + ":" + port, "phantomjs", port, seleniumHubConfig.port));
    })
}
