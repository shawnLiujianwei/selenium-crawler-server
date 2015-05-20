/**
 * Created by Shawn Liu on 15-5-16.
 */
var Promise = require("bluebird");
var Process = require("child_process");
var logger = require("node-config-logger").getLogger("./components/utils/dotterUtil.js");
var os = require("os");
exports.freePort = function (port) {
    return new Promise(function (resolve, reject) {
        logger.info("freeing up port " + port + " if still in use");
        if (os.platform().indexOf("darwin") !== -1 || os.platform().indexOf("linux") !== -1) {
            return _findPID(port)
                .then(function (pidList) {
                    if (pidList) {
                        return Promise.map(pidList, function (pid) {
                            return _killProcess(pid, port);
                        })
                    }

                })
                .then(function () {
                    resolve();
                })
        } else {
            logger.info("your OS is windows , will ignore this command");
            resolve();
        }

    });
}

function _findPID(port) {
    return new Promise(function (resolve, reject) {
        Process.exec("lsof -t -i:7010", function (err, data) {
            if (err) {
                resolve();
            } else {
                var str = data.toString().split("\n");
                str = str.filter(function (item) {
                    return item;
                }).map(function (item) {
                    return parseInt(item)
                })
                resolve(str);
            }

        })
    });
}

function _killProcess(pid, port) {
    return new Promise(function (resolve, reject) {
        Process.exec("kill -9 " + pid, function (err, data) {
            if (err) {
                logger.error("Error when kill process listen port '%s'", port);
                reject();
            } else {
                logger.info("kill process listen port '%s' ", port);
                resolve();
            }

        })
    });
}

exports.pintPort = function (port) {
    return new Promise(function (resolve, reject) {
        var comand = "ping http://127.0.0.1:" + port;
    })
}