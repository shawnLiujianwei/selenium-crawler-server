/**
 * Created by Shawn Liu on 15-5-15.
 */

var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;
var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("components/crawler/executor.js");
var retailerService = require("./retailer");
var async = require("async");
var useSeleniumServer = true;
var path = require("path");
var fs = require("fs");
var cacheServicae = require("../db/cache");
var errorLog = require("../db/errorLog");
exports.priceSpider = function (productUrl, locale, site, port, borwser) {
    return retailerService.getSelector(productUrl, locale, site)
        .then(function (selectorConfig) {
            if (selectorConfig && selectorConfig.status) {
                return _scrape(productUrl, selectorConfig.selectors, port, borwser)
                    .then(function (product) {
                        //return product;
                        return cacheServicae.insert(product)
                            .then(function () {
                                return product;
                            })
                    })
            } else {
                return selectorConfig;
            }
        })
        .catch(function (err) {
            logger.error(err);
            return {
                "status": false,
                "message": err.message || err
            };
        });
}
function _scrape(productURL, selectors, port, browser) {
    if (!browser) {
        browser = "phantomjs";
    }

    try {
        if (_checkValidBrowser(browser)) {
            var usingServer = 'http://127.0.0.1:' + port;
            if (browser !== "phantomjs") {
                usingServer = "http://127.0.0.1:4444/wd/hub"
            }
            var driver = new webdriver.Builder()
                .forBrowser(browser)
                .usingServer(usingServer)
                .build();

            //})
            return _scrape1(productURL, driver, selectors);

        } else {
            logger.error("Invalid browser '%s'", browser);
        }
    } catch (err) {
        logger.error(err);
        errorLog.insert(err)
            .then(function () {

            })
    }


}

function _scrape1(productURL, driver, selectors) {
    return new Promise(function (resolve, reject) {
        driver.get(productURL);
        var tmp = {
            "status": true,
            "errors": [],
            "productURL": productURL
        };

        logger.info("scraping ", productURL);
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
                    tmp[selector.field] = content;
                    callback()
                }, function onError(err) {
                    //logger.error(err.message);
                    tmp.status = false;
                    tmp.errors.push({
                        "selector": selector.field,
                        "message": err.message
                    });
                    callback();
                })
        }, function done() {

            _memoryUsage(process.id)
                .then(function (u) {
                    console.log("++++++++++" + u.memory);
                    return driver.quit()
                        .then(function () {
                            tmp.updateDate = new Date();
                            if (tmp.oos) {
                                tmp.status = true;
                                tmp.stock = "out-of-stock";
                                delete tmp.errors;
                            } else if (_onlyOOSError(tmp.errors)) {
                                tmp.status = true;
                                tmp.stock = "in-stock";
                                delete tmp.errors;
                            } else {

                            }
                            return _memoryUsage(process.id)
                                .then(function (us) {
                                    console.log("++++++++++" + us.memory);
                                    resolve(tmp);
                                })
                        })
                })


        });
    })
}

var pusage = require("pidusage");
var os = require("os")

function _memoryUsage(pid) {
    return new Promise(function (resolve, reject) {
        pusage.stat(process.pid, function (err, usage) {
            usage.memory = usage.memory / (1024 * 1024);
            usage.totalMemory = parseInt(os.totalmem()) / (1024 * 1024);
            usage.cpu = usage.cpu / 100;
            resolve(usage);
        })
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
