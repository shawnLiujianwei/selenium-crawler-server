/**
 * Created by Shawn Liu on 15-5-16.
 */

var Process = require("child_process");
var logger = require("node-config-logger").getLogger("./components/phantom/index.js")
var phantomjs = require('phantomjs')
var binPath = phantomjs.path;
var delay = require("../utils/delayPromise");
var dotterUtil = require("../utils/dotterUtil");
/**
 *
 * @param port
 * @param cb
 */
exports.setupHealthCheck = function (port, cb) {

}

exports.registerPhantomNode = function (hubPort, nodePort) {
    logger.info("Begin to register phantom node '%s' to selenium hub '%s'", nodePort, hubPort)

    return dotterUtil.freePort(nodePort)
        .then(function () {
            return new Promise(function (resolve, reject) {
                //var command = "phantomjs --webdriver=" + nodePort + " --webdriver-selenium-grid-hub=http://127.0.0.1:" + hubPort;;
                var args = [];
                args.push(binPath);
                args.push("--webdriver=" + nodePort);
                args.push("--webdriver-selenium-grid-hub=http://127.0.0.1:" + hubPort);
                var isRejected = false;
                var process = Process.exec(args.join(" "), function (err, data) {
                    logger.error(err);
                    isRejected = true;
                    reject();
                })
                delay(1000)
                    .then(function () {
                        if (!isRejected) {
                            logger.info("Register phantom node '%s' to selenium hub '%s'", nodePort, hubPort);
                            process.stdout.on('data', function (data) {
                                logger.info("Phantom Node '%s' :", nodePort, data.toString());
                            });
                            process.stderr.on('data', function (data) {
                                logger.info("Phantom Node '%s' :", nodePort, data.toString());
                            });
                            resolve();
                        }

                    })
            })
        })

}
