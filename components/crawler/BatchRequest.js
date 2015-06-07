var logger = require("node-config-logger").getLogger("app-webdriver/components/crawler/BatchRequest.js");
var Promise = require("bluebird");
var dispatcher = require("./dispatcher");
var delay = require("../utils/delayPromise")
var _requestId = 1;
function BatchRequest(options) {
    this.id = "br." + _requestId++;
    this.pages = options.productURLs;
    this.method = options.method;
    //// tack on a request id to each scraped page for check-pointing
    //this.pages.forEach(function (el) {
    //    //el._bid = this.id;
    //    //el.cacheValidity = (options && options.cacheValidity) || 0
    //}.bind(this));
    this.locale = options.locale;
    this.retailer = options.retailer;
    this.browser = options.browser;
    this.processing = false;
    this.response = {
        status: true,
        results: []
    };
}

BatchRequest.prototype.process = function () {
    var br = this;
    br.processing = true;
    this.promise = new Promise(function (resolve, reject) {
        br.resolve = resolve;
        br.reject = reject;
    });


    dispatcher.getAvailableInstance(br.browser)
        .then(function (crawlerInstance) {
            br.pages.forEach(function (productURL) {
                crawlerInstance.queue.push({
                    "productURL": productURL,
                    "method": br.method,
                    "locale": br.locale,
                    "retailer": br.retailer,
                    "browser": br.browser,
                    "batchRequest": br
                });
            });
        })

    return this.promise;
};

function _resolve(br) {
    logger.info("batch request " + br.id + " resolved with status " + br.response.status);
    br.processing = false;
    if (br.timeout) {
        clearTimeout(br.timeout);
    }
    // remove me from the _requests.array;
    br.resolve(br.response);

    // remove any outstanding job for this request.

    //reference ScrapeQueue.prototype.filter
    dispatcher.applyToAllPhantomInstances(function (phantom) {
        phantom.queue.filter(function (el) {
            return el._bid !== br.id;
        });
    });
}

BatchRequest.prototype.appendResults = function (result) {
    //logger.info("result have been added to batchRequest",results);
    this.response.results.push(result);
    if (this.response.results.length === this.pages.length) {
        this.resolve(this.response);
    } else {
        logger.info("batch request " + this.id + " got " + this.response.results.length + " out of " + this.pages.length + " results expected");
    }
}


module.exports = BatchRequest;