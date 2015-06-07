/**
 * Created by Shawn Liu on 2015/5/20.
 */
var async = require("async");
var logger = require("node-config-logger").getLogger("app-webdriver/components/crawler/ScrapeQueue.js");
var RetailerScript = require("./retailers/index");
var scrapeCache = require("../db/cache");
var _ = require("lodash");
function ScrapeQueue(crawlerInstance, options) {
    this.crawlerInstance = crawlerInstance;
    this.options = options || {
        maxRetries: 1
    };
    this.processing = false;
    this.jobs = [];
    this.id = this.options.id || crawlerInstance.id || '?';
}

ScrapeQueue.prototype.push = function (job) {
    var jobQueue = this;
    jobQueue.jobs.push(job);
    logger.info('New job added to job queue ' + jobQueue.id + '.  total=' + jobQueue.jobs.length);
    if (!jobQueue.processing) {
        logger.info('Resuming job queue ' + jobQueue.id + ' processing');
        jobQueue.processing = true;
        async.until(function isDone() {
            return jobQueue.jobs.length === 0;
        }, function next(callback) {
            var job = jobQueue.jobs.shift();
            job.attempt = job.attempt || 1;
            var batch = job.batchRequest;
            job.batchRequest;
            var retailerScript = new RetailerScript(job.productURL, job.locale, job.retailer);
            logger.info("job queue '%s' - scraping '%s' for batch request '%s'", jobQueue.id, job.productURL, batch.id);
            retailerScript.getSelector()
                .then(function (selectorConfig) {
                    return jobQueue.crawlerInstance.request(job, selectorConfig)//TODO need add parameters here
                        .then(function (result) {
                            //batch.appendResults();//TODO need add results to batchRequest here
                            logger.info("job queue '%s' - scraped successfully '%s' for batch request '%s'", jobQueue.id, job.productURL, batch.id);
                            return retailerScript.format(result);
                        })
                        .then(function (jsonResult) {
                            //batch.appendResults(jsonResult);
                            if (!jsonResult) {
                                jsonResult = {
                                    "status": false,
                                    "productURL": job.productURL,
                                    "errors": ["no result from CrawlerInstance"],
                                    "browser": job.browser || selectorConfig.browser
                                    //"selectors": _.cloneDeep(selectorConfig)
                                }
                            }
                            logger.warn(jsonResult);
                            return scrapeCache.insert(jsonResult)
                                .then(function () {
                                    batch.appendResults(jsonResult);
                                    //return jsonResult;
                                })

                        })
                        .catch(function (jsonResult) {
                            var tmp = _.cloneDeep(job);
                            delete tmp.batchRequest;
                            logger.error("Failed to process ", tmp, " with ", jsonResult.errors);
                            if (job.attempt++ <= jobQueue.options.maxRetries) {
                                jobQueue.jobs.unshift(job);
                            } else {
                                batch.appendResults(jsonResult);
                            }
                        });
                })
                .catch(function (err) {
                    //failed to get retailer selectors error;
                    batch.appendResults(err);
                })
                .finally(function () {
                    callback();
                });
        }, function done() {
            jobQueue.processing = false;
            logger.info("job queue '%s' is now empty", jobQueue.id);
        });
    }
}

module.exports = ScrapeQueue;