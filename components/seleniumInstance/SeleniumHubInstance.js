/**
 * Created by Shawn Liu on 15-5-22.
 */

var events = require("events");
var Promise = require("bluebird");
var util = require("../utils/dotterUtil");
var delay = require("../utils/delayPromise");
var logger = require("log4js").getLogger("lib/SeleniumHubInstance");
var chromeDriver = require("chromedriver").path;
var seleniumStandaloneJar = require("selenium-server-standalone-jar").path;
var Process = require("child_process");
var phantomjsBin = require('phantomjs')
/**
 *
 * @param type type is hub or node
 * @constructor
 */
function SeleniumHubInstance() {
    this.emitter = new events.EventEmitter();
    this.listening = false;
}


SeleniumHubInstance.prototype.start = function (port) {
    var ph = this;
    ph.port = port;
    if (ph.listening) {
        return Promise.resolve()
    } else {
        return util.freePort(ph.port)
            .then(function () {
                var args = [
                    "java",
                    "-jar"
                ];
                args.push(seleniumStandaloneJar);
                args.push("-Dwebdriver.chrome.driver=" + chromeDriver);
                args.push("-role hub -port " + port);
                args.push("-newSessionWaitTimeout 20000")
                args.push("-browserTimeout 20000");
                var cp = Process.exec(args.join(" "));
                cp.stdout.on("data", function (data) {
                    handleLog(data)
                })
                cp.stderr.on("data", function (data) {
                    handleLog(data)
                })
                cp.on("error", function () {
                    process.exit(-1);
                });
                cp.on("exit", function () {
                    process.exit(-1);
                });
                ph.listening = true;
                return delay(1000);
            })
    }
}


SeleniumHubInstance.prototype.registerNode = function (port, type, hubPort) {
    var hubInstance = this;
    hubInstance.port = hubPort || hubInstance.port;
    return util.freePort(port || hubInstance.port)
        .then(function () {
            return new Promise(function (resolve, reject) {
                if (type === "phantomjs") {
                    var args = [];
                    args.push("phantomjs");
                    args.push("--webdriver=" + port);
                    args.push("--webdriver-selenium-grid-hub=http://127.0.0.1:" + hubInstance.port);
                    var cp = Process.spawn(args.shift(), args);
                    //cp.stdout.pipe(process.stdout);
                    //cp.stderr.pipe(process.stderr);
                    cp.stdout.on("data", function (data) {
                        handleLog(data)
                    })
                    cp.stderr.on("data", function (data) {
                        handleLog(data)
                    });
                    logger.info("Register '%s' node with port '%s' to HUB '%s'", type, port, hubInstance.port);
                    delay(2000)
                        .then(function () {
                            resolve();
                        })
                } else {
                    var args = [];
                    args = [];
                    args.push("java")
                    args.push("-jar");
                    args.push(seleniumStandaloneJar);
                    args.push("-Dwebdriver.chrome.driver=" + chromeDriver);
                    //args.push(_getChromedriverPath());
                    args.push("-role node -hub http://127.0.0.1:" + hubInstance.port);
                    args.push("-port " + port);
                    var cp = Process.exec(args.join(" "), function (err, data) {
                        if (err) {
                            logger.info("failed to register '%s' node with port '%s' to HUB '%s'", type, port, hubInstance.port);
                            logger.error(err);
                            reject();
                        } else {
                            logger.info("Register '%s' node with port '%s' to HUB '%s'", type, port, hubInstance.port);
                            delay(2000)
                                .then(function () {
                                    resolve();
                                })
                        }
                    });
                    cp.stdout.on("data", function (data) {
                        handleLog(data)
                    })
                    cp.stderr.on("data", function (data) {
                        handleLog(data)
                    })
                }
            })

        })
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


module.exports = SeleniumHubInstance;