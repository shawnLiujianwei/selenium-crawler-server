/**
 * Created by Shawn Liu on 2015/5/20.
 */
var crawler = require("./components/crawler");
var logger = require("node-config-logger").getLogger("start.js");
var config = require("config");
var Process = require("child_process");
var Promise = require("bluebird");
var os = require("os");
crawler.setupCrawlerServer()
    .then(function () {
        return _startServer();
    })
    .catch(function (err) {
        logger.error(err);
        process.exit();
    })


function _startServer() {
    var appConfig = config.app;
    var command = [];
    command.push("pm2 start");
    command.push(appConfig.script);
    command.push("--name=" + appConfig.name);
    if (appConfig.mode === "cluster") {
        command.push("i " + appConfig.instances || os.cpus().length);
        command.push("--max-memory-restart");
        command.push(_getMaxMemory());

    }
    return new Promise(function (resolve, reject) {
        Process.exec(command.join(" "), function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })

}

function _getMaxMemory() {
    var freeM = os.totalmem();
    //var totalM = os.freemem();
    return Math.round(freeM / (1024 * 1024) * 0.9);
}