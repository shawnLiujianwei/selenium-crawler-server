/**
 * Created by Shawn Liu on 2015/5/20.
 */
var async = require("async");
var logger = require("node-config-logger").getLogger("app-webdriver/components/crawler/ScrapeQueue.js");
var retailerScript = require("./retailers");
function ScrapeQueue(crawlerInstance, options) {
    this.crawlerInstance = crawlerInstance;
    this.options = options || {
        maxRetries: 3
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
            var batch = job.batchRequest || batch1;
            delete job.batchRequest;
            retailerScript.getSelector(job.productURL, job.locale, job.retailer)
                .then(function (selectorConfig) {
                    return jobQueue.crawlerInstance.request(job, selectorConfig)//TODO need add parameters here
                        .then(function (result) {
                            batch.appendResults();//TODO need add results to batchRequest here
                        }).catch(function (err) {
                            logger.error("Failed to process ", job, " with ", err.message);
                            if (job.attempt++ <= q.options.maxRetries) {
                                jobQueue.jobs.unshift(job);
                            } else {
                                batch.appendResults({
                                    status: false,
                                    url: job.url,
                                    message: err.message
                                });
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
            logger.info('Scrape queue ' + jobQueue.id + ' is now empty');
        });
    }
}

module.exports = ScrapeQueue;