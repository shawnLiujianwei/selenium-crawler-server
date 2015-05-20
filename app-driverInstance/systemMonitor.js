var logger = require("node-config-logger").getLogger("components/crawler/systemMonitor.js");
var config = require("config");
var cronJob = require('cron').CronJob;
var os = require("os");
var Promise = require("bluebird");
var Process = require('child_process');
var delay = require("./../utils/delayPromise");
var pusage = require("pidusage");
var cronJob = require('cron').CronJob;
var enableMonitor = process.NODE_EVN === "production";
exports.monitorHub = function (process, port) {
    if (enableMonitor) {

    }
}

exports.monitorSeleniumNode = function (process, port) {

}

exports.monitorPhantomNode = function (process, port) {

}

exports.processUsage = function (pid) {
    return new Promise(function (resolve, reject) {
        pusage.stat(pid, function (err, usage) {
            usage.memory = usage.memory / (1024 * 1024);
            usage.totalMemory = parseInt(os.totalmem()) / (1024 * 1024);
            usage.cpu = usage.cpu / 100;
            resolve(usage);
        })
    })
}
