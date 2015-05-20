/**
 * Created by Shawn Liu on 15-5-16.
 */
var Promise = require("bluebird");
var path = require("path");
var logger = require("node-config-logger").getLogger("components/selenium-server/index.js");
var seleniumStandalone = require("selenium-standalone");
var dotterUtil = require("../utils/dotterUtil");
var Process = require("child_process");
var delay = require("../utils/delayPromise");
var seleniumJar = path.join(__dirname, "../../node_modules/selenium-standalone/.selenium/selenium-server/2.45.0-server.jar");
var chromedriverPath = path.join(__dirname, "../../node_modules/selenium-standalone/.selenium/chromedriver/2.15-x64-chromedriver");
exports.createHub = function (port) {
    if (!port) {
        port = 4444;
    }
    //java -jar selenium-server-standalone-2.44.0.jar -role hub -port 4441
    logger.info("Begin to create selenium hub on port '%s'", port);
    return dotterUtil.freePort(port)
        .then(function () {
            logger.info("====================")
            return new Promise(function (resolve, reject) {
                var args = [];
                args.push("java")
                args.push("-jar");
                args.push(seleniumJar);
                args.push("-Dwebdriver.chrome.driver=" + _getChromedriverPaht());
                //args.push(_getChromedriverPaht());
                args.push("-role hub -port " + port);
                args.push("-newSessionWaitTimeout 5000")
                args.push("-browserTimeout 10000");
                // args.push("maxInstances=5")
                var isRejected = false;
                var process = Process.exec(args.join(" "), function (err, data) {
                    logger.error(err);
                    isRejected = true;
                    reject();
                })
                delay(1000)
                    .then(function () {
                        if (!isRejected) {
                            logger.info("Start selenium Hub on port '%s'", port);
                            process.stdout.on('data', function (data) {
                                logger.debug("Selenium HUB :" + data.toString());
                            });
                            process.stderr.on('data', function (data) {
                                logger.debug("Selenium HUB :" + data.toString());
                            });
                            resolve(port);
                        }

                    })
            })
        })


}

exports.registerSeleniumNode = function (hubPort, nodePort) {
    if (!hubPort) {
        hubPort = 4444;
    }
    //java -jar selenium-server-standalone-2.44.0.jar -role hub -port 4441
    logger.info("Begin to register selenium node on port '%s' to hub '%s'", nodePort, hubPort);
    return dotterUtil.freePort(nodePort)
        .then(function () {
            var args = [];
            args = [];
            args.push("java")
            args.push("-jar");
            args.push(seleniumJar);
            args.push("-Dwebdriver.chrome.driver=" + _getChromedriverPaht());
            //args.push(_getChromedriverPaht());
            args.push("-role node -hub http://127.0.0.1:" + hubPort);
            args.push("-port " + nodePort);
            return new Promise(function (resolve, reject) {
                var isRejected = false;
                var process = Process.exec(args.join(" "), function (err, data) {
                    logger.error(err);
                    isRejected = true;
                    reject();
                })
                delay(1000)
                    .then(function () {
                        if (!isRejected) {
                            logger.info("Register selenium-standalone node '%s' to selenium hub '%s'", nodePort, hubPort);
                            process.stdout.on('data', function (data) {
                                logger.debug("Selenium Node stdout:" + data.toString());
                            });
                            process.stderr.on('data', function (data) {
                                logger.debug("Selenium Node stderr:" + data.toString());
                            });
                            resolve();
                        }

                    })
            })
        })

}


function _getChromedriverPaht() {
    return chromedriverPath;
    var platform = require("os").platform();
    var filename = "";
    if (platform.indexOf("win") !== -1) {
        filename = "win.exe";
    } else if (platform.indexOf("linux") !== -1 || platform.indexOf("ubuntu") !== -1) {
        filename = "linux";
    } else {
        filename = "mac";
    }
    return path.join(__dirname, "../../lib/chromedriver/" + filename);
}