/**
 * Created by Shawn Liu on 2015/5/20.
 */
var ScrapeQueue = require("./ScrapeQueue");
var Promise = require("bluebird");
var async = require("async");
var logger = require("node-config-logger").getLogger("components/crawler/CrawlerInstance.js");
var fs = require("fs");
var rp = require("request-promise");
var _ = require("lodash");
var webdriverIO = require('webdriverio');
var listenerConfig = require("config").listener.driverInstanceApp;
function CrawlerInstance(serverURL, type, port) {
    this.server = serverURL;
    this.port = port;
    this.id = serverURL;
    this.queue = new ScrapeQueue(this, {
        id: this.server,
        maxRetries: 3
    });
    this.type = type;
    this.timeout = 60000;

}

CrawlerInstance.prototype.request = function (job, retailerSelectorConfig) {

    if (job.method === "details") {
        return extractDetails(job.productURL, retailerSelectorConfig.selectors, retailerSelectorConfig.browser || job.browser, this);
    } else if (job.method === "links") {
        return extractDetails(job.productURL, retailerSelectorConfig.selectors, retailerSelectorConfig.browser || job.browser, this);
    }
    //return _scrape(job.productURL, selectorConfig.selectors, job.browser, this)
}


CrawlerInstance.prototype.restart = function () {
    // return rp("http://127.0.0.1:" + listenerConfig.port + "/driver/restart/" + this.type + "/" + this.port);
    return Promise.resolve();
}

function extractDetails(productURL, selectorArray, browser, crawlerInstance) {
    var client = webdriverIO
        .remote({
            desiredCapabilities: {
                browserName: browser
            },
            port: crawlerInstance.port
        });

    var jsonResult = {
        "status": true,
        "productURL": productURL,
        "scraped": {},
        "errors": [],
        "browser": browser,
        "selectors": _.cloneDeep(selectorArray)
    };

    var crawlerTimeout = null;
    return new Promise(function (resolve, reject) {
        //setup timeout function , make function return when server no response
        crawlerTimeout = setTimeout(function () {
            jsonResult.status = false;
            jsonResult.errors.push({
                "message": "crawler server timeout after " + crawlerInstance.timeout / 1000 + " seconds"
            });
            reject(jsonResult);
        }, crawlerInstance.timeout);

        client.init(function (err, data) {
            //err , when failed to init client
            //data , when init successfully , will return the server configurations like
            //var data = {
            //    sessionId: '15cd4400-0047-11e5-8923-d31ed4b62bfc',
            //    status: 0,
            //    value: {
            //        browserName: 'phantomjs',
            //        version: '1.9.8',
            //        driverName: 'ghostdriver',
            //        driverVersion: '1.1.0',
            //        platform: 'windows-7-32bit',
            //        javascriptEnabled: true,
            //        takesScreenshot: true,
            //        handlesAlerts: false,
            //        databaseEnabled: false,
            //        locationContextEnabled: false,
            //        applicationCacheEnabled: false,
            //        browserConnectionEnabled: false,
            //        cssSelectorsEnabled: true,
            //        webStorageEnabled: false,
            //        rotatable: false,
            //        acceptSslCerts: false,
            //        nativeEvents: true,
            //        proxy: {proxyType: 'direct'}
            //    }
            //}
            if (err) {
                logger.error("error when init webdriver");
                jsonResult.errors.push({
                    "message": err.message || err
                });
                jsonResult.status = false;
                reject(jsonResult);
            }
        })
            .then(function () {
                return client.url(productURL)
                    .catch(function (err) {
                        logger.error("error when open product page ,may need to init crawler again")
                        jsonResult.errors.push({
                            "message": err.message || err
                        });
                        jsonResult.status = false;
                        reject(jsonResult);
                    });
            })
            .then(function () {
                logger.debug("handle product crawler");
                //reached product page ,begin to scrape information
                var selectors = _.cloneDeep(selectorArray);
                async.until(function isDone() {
                    return selectors.length === 0;
                }, function next(callback) {
                    var se = selectors.shift();
                    logger.info("Scraping '%s' with selectors '%s'", se.field, se.content)
                    extractBySelector(client, se.content, se.scrapeType)
                        .then(function (scrapedResult) {
                            logger.info("Scraped '%s' ,value '%s'", se.field, scrapedResult.content);
                            if (scrapedResult.content) {
                                jsonResult.scraped[se.field] = scrapedResult.content;
                            } else {
                                se.errors = scrapedResult.errors;
                                jsonResult.errors.push(se)
                            }
                        })
                        .finally(function () {
                            callback();
                        })
                }, function done() {
                    resolve(jsonResult);
                })
            })
    })
        .then(function (result) {
            client.close();
            return result;
        })
        .catch(function (result) {
            return result;
        })
        .finally(function () {
            if (crawlerTimeout) {
                clearTimeout(crawlerTimeout);
            }
            logger.error("=====================    Close Client   ==================================")
        });
}

/**
 * scrape content by multiply selectors for single filed ,
 * if first one got result ,will break , otherwise execute next one
 * @param client webdriverIO object
 * @param selectors  css or xpath array , like ["div.test1","div.test2"]
 * @param type
 * @returns {*}
 */
function extractBySelector(client, selectors1, scrapeType) {
    return new Promise(function (resolve, reject) {
        var result = {
            "content": null,
            "errors": []
        };
        var selectors = _.cloneDeep(selectors1);
        if (selectors && Array.isArray(selectors)) {
            async.until(function isDone() {
                return result.content || selectors.length === 0;
            }, function next(callback) {
                var selector = selectors.shift();
                switch (scrapeType.type) {
                    case 'value' :
                    {
                        client.getValue(selector, handle);
                        break;
                    }
                    case 'html':
                    {
                        client.getHTML(selector, handle);
                        break;
                    }
                    case 'attribute':
                    {
                        client.getAttribute(selector, scrapeType.attribute, handle);
                        break;
                    }
                    default :
                    {
                        client.getText(selector, handle);
                    }
                }
                function handle(err, data) {
                    //logger.debug("scraped content '%s' with selector '%s' on type '%s'", data, selector, scrapeType.type);
                    if (err) {
                        result.errors.push({
                            "message": err.message || err
                        });
                        if (result.errors.length === selectors.length) {
                            logger.error(errors);
                        }
                    } else {
                        result.content = data;
                    }
                    callback();
                }
            }, function done() {
                if (result.content) {
                    //if one of the selector got content , mean got content successfully , can ignore other errors
                    delete result.errors;
                }
                resolve(result);
            })
        } else {
            result.errors.push({
                "message": "invalid selectors",
                "selector": selectors
            });
            resolve(result);
        }
    });
}


function _isValidBrowser(browser) {
    return true;
}


process.on("uncaughtException", function (err) {
    logger.error("UncaughtException:", err);
});

module.exports = CrawlerInstance;