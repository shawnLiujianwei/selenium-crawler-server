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
var SeleniumInstance = require("../seleniumInstance");
var config = require("config")
function CrawlerInstance(serverURL, type, port, hubPort) {
    this.server = serverURL;
    this.port = port;
    this.id = serverURL;
    this.queue = new ScrapeQueue(this, {
        id: this.server,
        maxRetries: 0
    });
    this.type = type;
    this.hub = hubPort;
    this.timeout = config.phantom.timeout || 60000;
    this.restartTimes = 3;

}

CrawlerInstance.prototype.request = function (job, retailerSelectorConfig, timeout) {

    if (job.method === "details") {
        return _scrape("details", job.productURL, retailerSelectorConfig.config.detail, retailerSelectorConfig.browser || job.browser, this, timeout);
    } else if (job.method === "links") {
        return _scrape("links", job.productURL, retailerSelectorConfig.config.search, retailerSelectorConfig.browser || job.browser, this);
    }
    //return _scrape(job.productURL, selectorConfig.selectors, job.browser, this)
}


CrawlerInstance.prototype.restart = function () {
    //return Promise.resolve();
    var crawlerInstance = this;
    //SeleniumInstance.port = crawlerInstance.hub;
    return SeleniumInstance.restartPhantom(crawlerInstance.port);
}

function _scrape(type, productURL, selectorConfig, browser, crawlerInstance, timeout) {
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
        "browser": browser,
        "updateTime": new Date()
        //"selectors": _.cloneDeep(selectorConfig)
    };

    return new Promise(function (resolve, reject) {
        crawlerTimeout = setTimeout(function () {
            jsonResult.status = false;
            jsonResult.errors = ["crawler server timeout after " + crawlerInstance.timeout / 1000 + " seconds"];
            reject(jsonResult);
        }, timeout || crawlerInstance.timeout);
        return _initClient(client, jsonResult, crawlerInstance, crawlerInstance.restartTimes)
            .then(function () {
                return _openUrl(client, productURL, jsonResult);
            })
            .then(function () {
                logger.info("scraping product '%s'", productURL);
                var promise = Promise.resolve();
                if (type === "details") {
                    promise = _extractStock(client, selectorConfig.stock)
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
                            return jsonResult;
                        })
                        .catch(function (errors) {
                            logger.error("#_extractStock():", errors);
                            jsonResult.status = false;
                            jsonResult.errors = errors;
                            return jsonResult;
                        })
                } else if (type === "links") {
                    promise = _extractLinks(client, selectorConfig)
                        .then(function (scrapedInfo) {
                            if (!scrapedInfo.status) {
                                jsonResult.status = false;
                                jsonResult.errors = scrapedInfo.errors;
                            } else {
                                jsonResult.status = true;
                            }
                            jsonResult.scraped = scrapedInfo.scraped;
                            return jsonResult;
                        })
                        .catch(function (errors) {
                            logger.error("#_extractLinks():", errors);
                            jsonResult.status = false;
                            jsonResult.errors = errors;
                            return jsonResult;
                        })
                }
                return promise;

            })
            .then(function (r) {
                return _endClient(client)
                    .then(function () {
                        return r;
                    })
            })
            .then(function (result) {
                //return result;
                resolve(result || jsonResult);
            })
            .catch(function (errResult) {
                logger.error("#_scrape():", errResult.errors);
                reject(errResult || jsonResult);
            })
            .finally(function () {

                if (crawlerTimeout) {
                    clearTimeout(crawlerTimeout);
                }

            });
    })
}

function _extractLinks(client, selectorConfig) {
    logger.warn("scraping links")
    return new Promise(function (resolve, reject) {
        var finished = false;
        var resultJSON = {};
        var products = [];
        async.until(function isDone() {
            return finished;
        }, function next(callback) {
            _extractProductForLink(client, selectorConfig.info)
                .then(function (scrapedResult) {
                    if (scrapedResult && scrapedResult.status) {
                        resultJSON.status = true;
                        //products = products.contact(scrapedResult.scraped);
                        Array.prototype.push.apply(products, scrapedResult.scraped);
                        var pagination = selectorConfig.pagination;
                        if (pagination && pagination.required) {
                            return _pagination(client, pagination)
                                .then(function (r) {
                                    if (!r || !r.status) {
                                        resultJSON.status = true;
                                        resultJSON.scraped = products;
                                        finished = true;
                                    }
                                })
                        } else {
                            resultJSON.status = true;
                            resultJSON.scraped = products;
                            finished = true;
                        }
                    } else {
                        finished = true;
                        resultJSON.status = false;
                        resultJSON.errors = scrapedResult.errors;
                    }
                })
                .catch(function (err) {
                    logger.error(err);
                    resultJSON.status = false;
                    resultJSON.errors = err.errors || [err.message || err];
                })
                .finally(function () {
                    callback();
                });
        }, function done() {

            resolve(resultJSON);
        })
    });
}

function _generateProduct(extractJSON) {
    if (extractJSON && Object.keys(extractJSON).length > 0) {
        var resultJSON = {};
        var array = [];
        var fields = Object.keys(extractJSON);
        var baseSize = 0;
        var valid = true;
        fields.forEach(function (field) {
            if (baseSize === 0) {
                baseSize = extractJSON[field].length;
            }
            valid = valid && (baseSize === extractJSON[field].length);
        });
        if (!valid) {
            resultJSON.status = false;
            resultJSON.errors = ["when get product links , name and url don't math"];
        } else {
            for (var i = 0; i < extractJSON[fields[0]].length; i++) {
                var t = {};
                t[fields[0]] = extractJSON[fields[0]][i];
                for (var j = 1; j < fields.length; j++) {
                    t[fields[j]] = extractJSON[fields[j]][i];
                }
                array.push(t);
            }
            resultJSON.status = true;
            resultJSON.result = array;
        }
    } else {
        resultJSON.status = true;
        resultJSON.result = [];
    }

    return resultJSON;
}

function _pagination(client, pageConfig) {
    return new Promise(function (resolve, reject) {
        var resultJSON = {};
        if (pageConfig.type === "scroll") {
            resultJSON.status = false;
            resolve(resultJSON);
        } else {//no scroll , will be click
            client.click(pageConfig.button, function (err, data) {
                if (err) {
                    logger.error(err);
                    resultJSON.status = false;//pagination button doesn't exist or has finished pagination
                } else {
                    resultJSON.status = true;
                }
                resolve(resultJSON);
            });
        }
    });
}

function _extractProductForLink(client, infos1, domain) {
    var infos = _.cloneDeep(infos1);
    return new Promise(function (resolve, reject) {
        var breakDown = false;
        var json = {};
        var resultJSON = {};
        async.until(function isDone() {
            return infos.length === 0 || breakDown;
        }, function next(callback) {
            var infoC = infos.shift();
            _scrapeBySelectors(client, infoC.scrape, infoC.selectors)
                .then(function (resultContent) {
                    if (resultContent && resultContent.status) {
                        resultJSON.status = true;
                        if (json[infoC.field]) {
                            json[infoC.field] = [];
                        }
                        json[infoC.field] = resultContent.content;
                    } else {
                        breakDown = true;
                        resultJSON.status = false;
                        resultJSON.errors = err.errors;
                    }
                })
                .catch(function (err) {
                    resultJSON.status = false;
                    resultJSON.errors = err.errors || [err.message || err];
                })
                .finally(function () {
                    callback();
                })
        }, function done() {
            if (resultJSON.status) {
                var r = _generateProduct(json);
                resultJSON.status = r.status;
                resultJSON.scraped = r.result;
            }
            resolve(resultJSON);
        })
    });
}

/**
 * init webdriverIO client , when failed to init
 * will try to re-register the phantom(chrome) node by given port
 * @param client
 * @param jsonResult
 * @param crawlerInstance
 * @param retryTimes
 * @returns {*}
 * @private
 */
function _initClient(client, jsonResult, crawlerInstance, retryTimes) {
    if (!retryTimes && retryTimes !== 0) {
        retryTimes = 1;
    }

    function _init() {
        return new Promise(function (resolve, reject) {
            client.init(function (err, data) {
                if (err) {
                    logger.error("error when init webdriver");
                    jsonResult.errors = [err.message || err];
                    jsonResult.status = false;
                    reject(jsonResult);
                } else {
                    resolve();
                }
            })
        })
    }

    return _init()
        .catch(function (jsonResult) {
            if (retryTimes > 0) {
                retryTimes--;
                return crawlerInstance.restart()
                    .then(function () {
                        return _init();
                    })
                    .catch(function () {
                        return Promise.reject(jsonResult);
                    })

            } else {
                return Promise.reject(jsonResult);
            }
        });

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


//process.on("uncaughtException", function (err) {
//    logger.error("CrawlerInstance.js UncaughtException:", err);
//});

module.exports = CrawlerInstance;