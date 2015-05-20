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
function CrawlerInstance(serverURL, type) {
    this.server = serverURL;
    this.port = serverURL.replace("http://127.0.0.1:", "");
    this.id = serverURL;
    this.queue = new ScrapeQueue(this, {
        id: this.server,
        maxRetries: 3
    });
    this.type = type;
    this.timeout = 30000;

}

CrawlerInstance.prototype.request = function (job, selectorConfig) {

    return _scrape(job.productURL, selectorConfig.selectors, job.browser, this)
}

var listenerConfig = require("config").listener.driverInstanceApp;
CrawlerInstance.prototype.restart = function () {
    return rp("http://127.0.0.1:" + listenerConfig.port + "/driver/" + this.type + "/" + this.port);
}

function _scrape(productURL, selectors, browser, ph) {
    var jsonResult = {
        "status": true,
        "errors": [],
        "productURL": productURL
    };
    return new Promise(function (resolve, reject) {
        if (!browser) {
            browser = "phantomjs";
        }

        var instanceTimeout = setTimeout(function () {
            //if (br.promise && br.promise.isPending()) {
            //    logger.error("batch request " + br.id + " timed out");
            //    br.abort("batch timeout exceeded");
            //}
            ph.restart()
                .catch(function(err){
                    logger.error(err);
                })
                .finally(function () {
                    resolve({
                        "status": false,
                        "message": "server '" + ph.id + "' timeout"
                    })
                })


        }, ph.timeout);

        try {
            if (_checkValidBrowser(browser)) {
                var driver = new webdriver.Builder()
                    .forBrowser(browser)
                    .usingServer(ph.server)
                    .build();
                driver.get(productURL);

                async.until(function isDone() {
                    return selectors.length === 0;
                }, function next(callback) {
                    var selector = selectors.shift();
                    var byC = "";
                    if (selector.selectorType === "css") {
                        byC = By.css(selector.content);
                    } else {
                        byC = By.xpath(selector.content);
                    }
                    var element = driver.findElement(byC);
                    element.getText()
                        .then(function (content) {
                            jsonResult[selector.field] = content;
                            callback()
                        }, function onError(err) {
                            //logger.error(err.message);
                            jsonResult.status = false;
                            jsonResult.errors.push({
                                "selector": selector.field,
                                "message": err.message
                            });
                            callback();
                        })
                }, function done() {
                    driver.quit()
                        .then(function () {
                            jsonResult.updateDate = new Date();
                            if (jsonResult.oos) {
                                jsonResult.status = true;
                                jsonResult.stock = "out-of-stock";
                                delete jsonResult.errors;
                            } else if (_onlyOOSError(jsonResult.errors)) {
                                jsonResult.status = true;
                                jsonResult.stock = "in-stock";
                                delete jsonResult.errors;
                            }
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
            logger.error(err);
            jsonResult.errors.push({
                "message": err.message || err
            })
            clearTimeout(instanceTimeout);
            resolve(jsonResult);
        }
    })
}

function _onlyOOSError(errors) {
    return !errors ? true : (errors.length === 1 && errors[0].selector === "oos")
}

function _checkValidBrowser(browser) {
    return true;
}

function writeScreenshot(data, name) {
    name = name || 'ss.png';
    var screenshotPath = path.join(__dirname, "");
    fs.writeFileSync(screenshotPath + name, data, 'base64');
};

module.exports = CrawlerInstance;