/**
 * Created by Shawn Liu on 2015/5/20.
 */

var logger = require("node-config-logger").getLogger("start.js");
var config = require("config");
var Process = require("child_process");
var Promise = require("bluebird");
var os = require("os");
//var seleniumServer = require("../selenium");
//var phantomInstance = require("../phantom");
//var listenerConfig = require("config").listener;
var path = require("path");
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = path.join(__dirname, "./config");
//var driverInstance = require("./app-driverInstance/startup");
_setupCrawlerServer()
    .then(function () {
        //return _startServer();
    })
    .catch(function (err) {
        logger.error(err);
        process.exit();
    })


function _setupCrawlerServer() {
    return new Promise(function (resolve, reject) {
        var command = [];
        command.push("pm2 start");
        command.push("app-driverInstance/server.js");
        command.push("--name=phantomCluster");
        var cp = Process.exec(command.join(" "), function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
        cp.stdout.on('data', function (data) {
            logger.info(data.toString());
        });
        cp.stderr.on('data', function (data) {
            logger.error(data.toString());
        });
    })
}

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
        return new Promise(function (resolve, reject) {
            Process.exec(command.join(" "), function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    } else {
        //command.push("pm2 start");
        //command.push(appConfig.script);
        //command.push("--name=webdriver")
        return new Promise(function (resolve, reject) {
            var cp = Process.exec(command.join(" "), function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
            cp.stdout.on('data', function (data) {
                logger.info(data.toString());
            });
            cp.stderr.on('data', function (data) {
                logger.error(data.toString());
            });
        })
    }

}

function _getMaxMemory() {
    var freeM = os.totalmem();
    //var totalM = os.freemem();
    return Math.round(freeM / (1024 * 1024) * 0.9);
}