/**
 * Created by Shawn Liu on 15-5-15.
 */

var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;
var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("components/crawler/executor.js");
var async = require("async");
var useSeleniumServer = true;
var path = require("path");
var fs = require("fs");
var cacheServicae = require("./cache");
var errorLog = require("./errorLog");
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