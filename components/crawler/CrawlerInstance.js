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
        maxRetries: 0
    });
    this.type = type;
    this.timeout = 120000;

}

CrawlerInstance.prototype.request = function (job, retailerSelectorConfig, timeout) {

    if (job.method === "details") {
        return extractDetails(job.productURL, retailerSelectorConfig.config.detail, retailerSelectorConfig.browser || job.browser, this, timeout);
    } else if (job.method === "links") {
        return extractDetails(job.productURL, retailerSelectorConfig.config.search, retailerSelectorConfig.browser || job.browser, this);
    }
    //return _scrape(job.productURL, selectorConfig.selectors, job.browser, this)
}


CrawlerInstance.prototype.restart = function () {
    // return rp("http://127.0.0.1:" + listenerConfig.port + "/driver/restart/" + this.type + "/" + this.port);
    return Promise.resolve();
}

function extractDetails(productURL, selectorConfig, browser, crawlerInstance, timeout) {
    var client = webdriverIO
        .remote({
            desiredCapabilities: {
                browserName: browser
            },
            port: crawlerInstance.port
        });


    var crawlerTimeout = null;
    //setup timeout function , make function return when server no response
    var jsonResult = {
        "status": true,
        "productURL": productURL,
        "scraped": {},
        "errors": [],
        "browser": browser
        //"selectors": _.cloneDeep(selectorConfig)
    };

    return new Promise(function (resolve, reject) {
        crawlerTimeout = setTimeout(function () {
            jsonResult.status = false;
            jsonResult.errors = ["crawler server timeout after " + crawlerInstance.timeout / 1000 + " seconds"];
            reject(jsonResult);
        }, timeout || crawlerInstance.timeout);
        return _initClient(client,jsonResult)
            .then(function () {
                //return client.url(productURL)
                //    .catch(function (err) {
                //        logger.error("error when open product page ,may need to init crawler again")
                //        jsonResult.errors.push({
                //            "message": err.message || err
                //        });
                //        jsonResult.status = false;
                //        reject(jsonResult);
                //    });
                return _openUrl(client, productURL, jsonResult);
            })
            .then(function () {
                //logger.debug("scraping '%s'", productURL);
                ////reached product page ,begin to scrape information
                //var selectors = _.cloneDeep(selectorArray);
                //async.until(function isDone() {
                //    return selectors.length === 0;
                //}, function next(callback) {
                //    var se = selectors.shift();
                //    logger.info("Scraping '%s' with selectors '%s'", se.field, se.content)
                //    extractBySelector(client, se.content, se.scrapeType)
                //        .then(function (scrapedResult) {
                //            logger.info("Scraped '%s' ,value '%s'", se.field, scrapedResult.content);
                //            if (scrapedResult.content) {
                //                jsonResult.scraped[se.field] = scrapedResult.content;
                //            } else {
                //                se.errors = scrapedResult.errors;
                //                jsonResult.errors.push(se)
                //            }
                //        })
                //        .finally(function () {
                //            callback();
                //        })
                //}, function done() {
                //    resolve(jsonResult);
                //})
                logger.info("scraping product '%s'", productURL);
                return _extractStock(client, selectorConfig.stock)
                    .then(function (scrapedStock) {
                        jsonResult.status = true;
                        jsonResult.scraped.stock = scrapedStock;
                        return _extractInfo(client, selectorConfig.info, jsonResult.scraped);
                    })
                    .then(function (scrapedInfo) {
                        if (!scrapedInfo.status) {
                            jsonResult.status = false;
                            jsonResult.errors = scrapedInfo.errors;
                        } else {
                            jsonResult.status = true;
                           delete jsonResult.errors;
                        }
                        delete scrapedInfo.status;
                        delete scrapedInfo.errors;
                        jsonResult.scraped = scrapedInfo;
                        jsonResult.scraped = scrapedInfo;
                        return jsonResult;
                    })
                    .catch(function (errors) {
                        logger.error("#_extractStock():", errors);

                        jsonResult.status = false;
                        jsonResult.errors = errors;
                        return jsonResult;
                    })
            })
            .then(function (r) {
                return _endClient(client)
                    .then(function(){
                        return r;
                    })
            })
            .then(function (result) {
                //return result;
                resolve(result || jsonResult);
            })
            .catch(function (errResult) {
                logger.error("#extractDetails():", errResult.errors);
                reject(errResult || jsonResult);
            })
            .finally(function () {

                if (crawlerTimeout) {
                    clearTimeout(crawlerTimeout);
                }

            });
    })


}

function _initClient(client, jsonResult) {
    return new Promise(function (resolve, reject) {
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
                jsonResult.errors = [err.message || err];
                jsonResult.status = false;
                reject(jsonResult);
            } else {
                logger.warn("resolve already")
                resolve();
            }
        })
    })
}

function _openUrl(client, productURL, jsonResult) {
    return new Promise(function (resolve, reject) {
        client.url(productURL)
            .then(function () {
                resolve();
            })
            .catch(function (err) {
                logger.error("error when open product page ,may need to init crawler again")
                jsonResult.errors.push({
                    "message": err.message || err
                });
                jsonResult.status = false;
                reject(jsonResult);
            });
    })
}

function _endClient(client) {
    return new Promise(function (resolve, reject) {
        client.endAll(function () {
            logger.error("=====================    Close Client   ==================================")
            resolve();
        })
    })
}

/**
 * scrape all other information exclude stock meanwhile check whether
 * filed is required base on stock info  , when it's required and can not get
 * value ,will throw exception
 * @param client
 * @param infos  Array
 * @param scrapedResult like {"stock":"in-stock"}
 * @returns {Promise}
 * @private
 */
function _extractInfo(client, infos, scrapedResult1) {
    var scrapedResult = _.cloneDeep(scrapedResult1);
    scrapedResult.status = true;
    return new Promise(function (resolve, reject) {
        infos = infos.filter(function (item) {
            return item.selectors && item.selectors.length > 0;
        });
        var throeError = false;
        async.until(function isDone() {
            return infos.length === 0 || throeError;
        }, function next(callback) {

            try {
                var info = infos.shift();
                var required = info.requiredWhenStatusInclude.some(function (item) {
                    return item === scrapedResult.stock;
                });

                _scrapeBySelectors(client, info.scrape, info.selectors)
                    .then(function (scrapedR) {
                        if (scrapedR.status) {
                            scrapedResult[info.field] = scrapedR.content;
                        } else {
                            if (required) {
                                throeError = true;
                                scrapedResult.status = false;
                                scrapedResult.errors = scrapedR.errors;
                            }
                        }
                    })
                    .catch(function (err) {
                        logger.error(err);
                    })
                    .finally(function () {
                        callback();
                    })
            } catch (e) {
                throeError = true;
                scrapedResult.status = false;
                scrapedResult.errors = [e.message || e];
                callback();
            }


        }, function done() {
            resolve(scrapedResult);
        });
    })
}

/**
 * extract stock info , must be able to find one valid status from
 * stockConfig.statusList , otherwise will throw exception
 * @param client
 * @param stockConfig
 * @returns {Promise}
 * @private
 */
function _extractStock(client, stockConfig) {
    var result = {};
    logger.info("Scraping stock info");
    return new Promise(function (resolve, reject) {
        try {
            var finished = false;
            var statusList = stockConfig.statusList.filter(function (item) {
                return item.selectors && item.selectors.length > 0
            });
            async.until(function isDone() {
                return statusList.length === 0 || finished;
            }, function next(callback) {
                var statusConfig = statusList.shift();
                _scrapeBySelectors(client, statusConfig.scrape, statusConfig.selectors)
                    .then(function (statusScrapedData) {
                        if (statusScrapedData.status) {
                            result.status = true;
                            result.content = statusConfig.status;
                            finished = true;
                        }
                    })
                    .catch(function (err) {
                        logger.error("#_scrapeBySelectors() :", err);
                        result.status = false;
                        result.errors = [err.message || err];
                        finished = true;
                    })
                    .finally(function () {
                        callback()
                    })
            }, function done() {
                //resolve(result)
                if (result.status) {
                    resolve(result.content);
                } else {
                    reject(result.errors);
                }
            })

        } catch (err) {
            result.status = false;
            result.errors = [err.message || err];
            reject(result);
        }


    });
}

/**
 * scrape for specified filed with multiply selectors ,
 * will forEach the selectors to scrape ,will break when find valid value or throw error
 * @param client
 * @param scrapeConfig
 * @param selectors
 * @returns {Promise}
 * @private
 */
function _scrapeBySelectors(client, scrapeConfig, selectors) {
    return new Promise(function (resolve, reject) {
        var finished = false;
        var selectorsLength = selectors.length;
        var result = {};
        var errors = [];
        async.until(function isDone() {
            return selectors.length === 0 || finished;
        }, function next(callback) {
            var selector = selectors.shift();
            switch (scrapeConfig.type) {
                case 'value' :
                {
                    client.getValue(selector, _handle);
                    break;
                }
                case 'html':
                {
                    client.getHTML(selector, _handle);
                    break;
                }
                case 'attribute':
                {
                    client.getAttribute(selector, scrapeConfig.attr, _handle);
                    break;
                }

                case 'elementExist':
                {
                    client.isExisting(selector, _handle);
                    break;
                }
                case 'textInclude':
                {
                    client.getText(selector, function (err, data) {
                        _handle(err, err ? false : _include(data, scrapeConfig.keys));
                    });
                    break;
                }
                default :
                {
                    client.getText(selector, _handle);
                }
            }


            function _handle(err, data) {
                //logger.debug("scraped content '%s' with selector '%s' on type '%s'", data, selector, scrapeType.type);
                if (err) {
                    errors.push(err.message || err);
                    if (errors.length === selectorsLength) {
                        logger.error(errors);
                        result.status = false;
                        result.errors = errors;
                    }
                } else {
                    result.status = true;
                    result.content = data;
                    finished = true;
                }
                callback();
            }
        }, function done() {
            resolve(result);
        })
    })
}

/**
 * check whether resultStr contains any string from keys array
 * @param resultStr String
 * @param keys  Array
 * @returns {*}
 * @private
 */
function _include(resultStr, keys) {
    if (resultStr && keys) {
        resultStr = resultStr.toString().toLowerCase();
        return keys.some(function (item) {
            return item && resultStr.indexOf(item.toLowerCase()) !== -1;
        })
    } else {
        return false;
    }
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
    logger.error("CrawlerInstance.js UncaughtException:", err);
});

module.exports = CrawlerInstance;