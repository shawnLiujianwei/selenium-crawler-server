/**
 * Created by Shawn Liu on 2015/5/20.
 */

var logger = require("node-config-logger").getLogger("start.js");
var config = require("config");
var Process = require("child_process");
var Promise = require("bluebird");
var os = require("os");
var path = require("path");
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = path.join(__dirname, "./config");
var phantomClusterStartupFile = path.join(__dirname, "./components/seleniumInstance/startup.js");


function _killExisting() {
    var names = [
        "phantomCluster",
        "webCrawler"
    ];
    return Promise.map(names, function (name) {
        var command = [
            "pm2",
            "delete",
            name
        ];
        return _executeCommand(command, true);//always return resolve(), just in case the process doesn't exist
    })
}

function _setupCrawlerServer() {
    var command = [];
    command.push("pm2 start");
    command.push(phantomClusterStartupFile);
    command.push("--name=phantomCluster");
    if (process.env.NODE_ENV === "production") {
        command.push("--max-memory-restart");
        command.push(_getMaxMemory());
    }
    return _executeCommand(command);
}

function _startServer() {
    var command = [];
    command.push("pm2 start");
    command.push(path.join(__dirname, "./app.js"));
    command.push("--name=webCrawler");
    if (process.env.NODE_ENV === "production") {
        //command.push("i " + os.cpus().length);
        command.push("-i 2");
        command.push("--max-memory-restart");
        command.push(_getMaxMemory());
    }
    return _executeCommand(command);

}

function _executeCommand(command, alwaysTrue) {
    return new Promise(function (resolve, reject) {
        var cp = Process.exec(command.join(" "), function (err, data) {
            if (err && !alwaysTrue) {
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


function _getMaxMemory() {
    var freeM = os.totalmem();
    //var totalM = os.freemem();
    return Math.round(freeM / (1024 * 1024) * 0.9);
}

_killExisting()
    .then(function () {
        return _setupCrawlerServer();
    })
    .then(function () {
        return _startServer();
    })
    .catch(function (err) {
        logger.error(err);
        process.exit();
    })