/**
 * Created by Shawn Liu on 15-6-7.
 */
var phantomPorts = require("config").phantom;
var Promise = require("bluebird");
var Process = require("child_process");
var util = require("../utils/dotterUtil");
var delay = require("../utils/delayPromise");
var logger = require("log4js").getLogger("components/seleniumInstance/index.js");
var defaultErrorStartTimes = 3;//if failed to start phantom more than defaultErrorStartTimes , will exit;
exports.start = function () {
    return Promise.map(phantomPorts, function (port) {
        return exports.startPhantom(port);
    });
}

/**
 *
 * @param port
 * @param errorTimes , use restartTimes to avoid this function come into restart loop
 * @returns {*}
 */
exports.startPhantom = function (port, errorTimes) {
    errorTimes |= 0;
    return util.freePort(port)
        .then(function () {
            return new Promise(function (resolve, reject) {
                var args = [];
                args.push("phantomjs");
                args.push("--webdriver=" + port);
                var cp = Process.spawn(args.shift(), args);
                //cp.stdout.pipe(process.stdout);
                //cp.stderr.pipe(process.stderr);
                cp.stdout.on("data", function (data) {
                    errorTimes = 0;
                    handleLog(data)
                })
                cp.stderr.on("data", function (data) {
                    handleLog(data)
                });
                cp.on("exit", function () {

                    if (errorTimes < defaultErrorStartTimes) {
                        logger.warn("phantom on port '%s' crashed,will auto restart", port);
                        errorTimes++;
                        exports.startPhantom(port, errorTimes);//auto restart when child process exit
                    } else {
                        logger.error("failed to restart phantom on port '%s' more than %s times, will kill process", port, defaultErrorStartTimes);
                        process.exit();
                    }

                })
                delay(2000)
                    .then(function () {
                        logger.info("start phantom with port '%s'", port);
                        resolve();
                    });

            })
        })
}

/**
 *
 * @param port
 */
exports.restartPhantom = function (port) {
    return util.freePort(port);
}

function handleLog(data) {
    data = data.toString();
    logger.debug(data);
    //if (data.indexOf("INFO") !== -1) {
    //    logger.info(data);
    //} else if (data.indexOf("DEBUG") !== -1) {
    //    logger.debug(data);
    //} else if (data.indexOf("WARN") !== -1) {
    //    logger.warn(data);
    //} else if (data.indexOf("ERROR") !== -1) {
    //    logger.error(data);
    //} else {
    //    logger.info(data);
    //}
}