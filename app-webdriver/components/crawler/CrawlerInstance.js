/**
 * Created by Shawn Liu on 2015/5/20.
 */
var ScrapeQueue = require("./ScrapeQueue");
var Promise = require("bluebird");
var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;
var async = require("async");
var logger = require("node-config-logger").getLogger("app-webdriver/components/crawler/CrawlerInstance.js");
var fs = require("fs");
var rp = require("request-promise");
var _ = require("lodash");
function CrawlerInstance(serverURL, type, port) {
    this.server = serverURL;
    this.port = port;
    this.id = serverURL;
    this.queue = new ScrapeQueue(this, {
        id: this.server,
        maxRetries: 3
    });
    this.type = type;
    this.timeout = 30000;

}

CrawlerInstance.prototype.request = function (job, retailerSelectorConfig) {

    if (job.method === "details") {
        return _scrapeDetails(job.productURL, retailerSelectorConfig.selectors, retailerSelectorConfig.browser || job.browser, this);
    } else if (job.method === "links") {
        return _scrapeDetails(job.productURL, retailerSelectorConfig.selectors, retailerSelectorConfig.browser || job.browser, this);
    }
    //return _scrape(job.productURL, selectorConfig.selectors, job.browser, this)
}

var listenerConfig = require("config").listener.driverInstanceApp;
CrawlerInstance.prototype.restart = function () {
    // return rp("http://127.0.0.1:" + listenerConfig.port + "/driver/restart/" + this.type + "/" + this.port);
    return Promise.resolve();
}

function _scrapeLinks() {

}

/**
 * assume each element has multiply css or xpath selector
 * @param driver
 * @param selectorDetails
 * @param jsonResult
 * @returns {*}
 * @private
 */
function _extractDataBySelector(driver, selectorDetails, jsonResult, productURL) {
    return new Promise(function (resolve, reject) {
        var selectors = _.cloneDeep(selectorDetails.content);
        jsonResult[selectorDetails.field] = null;
        async.until(function isDone() {
            return selectors.length === 0 || jsonResult[selectorDetails.field];
        }, function next(callback) {
            var selector = selectors.shift();
            var byC = "";
            if (selectorDetails.selectorType === "css") {
                byC = By.css(selector);
            } else {
                byC = By.xpath(selector);
            }
            var element = driver.findElement(byC);
            element.getText()
                .then(function (content) {
                    jsonResult[selectorDetails.field] = content;
                    callback()
                }, function onError(err) {
                    var error = {
                        "productURL": productURL,
                        "message": err.state,
                        "code": err.code,
                        "selector": selector
                    };
                    logger.error(error);
                    delete error.productURL;
                    if (selectors.length === 0) {
                        jsonResult.status = false;
                        error.selector = selectorDetails;
                        jsonResult.errors.push(error);
                    }
                    callback();
                })
        }, function done() {
            resolve(jsonResult);
        })
    });
}

function _scrapeDetails(productURL, selectors, browser, ph) {
    var jsonResult = {
        "status": true,
        "productURL": productURL,
        "errors": [],
        "browser": browser,
        "selectors": _.cloneDeep(selectors)
    };
    return new Promise(function (resolve, reject) {
        if (!browser) {
            browser = "phantomjs";
        }

        var instanceTimeout = setTimeout(function () {
            ph.restart()
                .catch(function (err) {
                    logger.error("Restart phantom instance:", err);
                })
                .finally(function () {

                    jsonResult.errors.push({
                        "message": "server '" + ph.id + "' timeout"
                    })
                    resolve(jsonResult)
                })


        }, ph.timeout);
        try {
            if (_isValidBrowser(browser)) {
                var driver = new webdriver.Builder()
                    .forBrowser(browser)
                    .usingServer(ph.server)
                    .build();
                driver.get(productURL);

                async.until(function isDone() {
                    return selectors.length === 0;
                }, function next(callback) {
                    var selector = selectors.shift();
                    _extractDataBySelector(driver, selector, jsonResult, productURL)
                        .then(function (result) {
                            jsonResult = result;
                        })
                        .catch(function (err) {
                            logger.error(err)
                        })
                        .finally(function () {
                            callback();
                        })
                }, function done() {
                    driver.quit()
                        .then(function () {
                            clearTimeout(instanceTimeout);
                            resolve(jsonResult);
                        })
                })
            } else {
                logger.error("Invalid browser '%s'", browser);
                jsonResult.errors.push({
                    "message": "Invalid browser '" + browser + "'"
                })
                clearTimeout(instanceTimeout);
                resolve(jsonResult);
            }
        } catch (err) {
            logger.error("catch error");
            logger.error(err);
            jsonResult.errors.push({
                "message": err.message || err
            })
            clearTimeout(instanceTimeout);
            resolve(jsonResult);
        }
    })
}


function _isValidBrowser(browser) {
    return true;
}

function writeScreenshot(data, name) {
    name = name || 'ss.png';
    var screenshotPath = path.join(__dirname, "");
    fs.writeFileSync(screenshotPath + name, data, 'base64');
};

process.on("uncaughtException", function (err) {
    logger.error("UncaughtException:", err);
});

module.exports = CrawlerInstance;