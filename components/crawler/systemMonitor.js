var logger = require("node-config-logger").getLogger("components/crawler/systemMonitor.js");
var config = require("config");
var cronJob = require('cron').CronJob;
var os = require("os");
var Promise = require("bluebird");
var Process = require('child_process');
var delay = require("./../utils/delayPromise");
var pusage = require("pidusage");

var memoryCheck = function () {
    var num = 3;
    new cronJob({
        cronTime: "0 */3 * * * *",
        onTick: function () {
            logger.info("Checking memory...");
            _check(3);
        },
        start: true
    });

    function _check(num1) {
        var usage = exports.getMemoryUsage();
        if (usage > config.listener.memoryUsage) {
            if (num1 === 0) {
                logger.warn("memory usage is higher than '" + config.listener.memoryUsage + "', restart all casper servers");
                //dispatcher.restart();
                serverStatus.insertExpressLog("restart", "memory usage is higher than " + config.listener.memoryUsage)
                    .finally(_foreverRestart);
            } else {
                num1--;
                logger.warn("memroy usage alarm " + (num - num1) + " time");
                delay(5000)
                    .then(function () {
                        _check(num1);
                    })
            }

        } else {
            return;
        }
    }
};

exports.getMemoryUsage = function () {
    return parseFloat(((os.totalmem() - os.freemem()) / os.totalmem()));
}

exports.killPort = function (port) {
    return new Promise(function (resolve, reject) {
        //logger.info("freeing up port " + port + " if still in use");
        logger.warn("kill port:" + port);
        //var command = "kill -9 `lsof -n -iTCP:" + port + " | grep LISTEN | awk '{print $2}'`";
        var command = "kill $(lsof -t -i:" + port + ")";
        Process.exec(command, function () {
            resolve();
        });
    });
}

exports.start = function () {
    logger.info("Setup health check...");
    monitorForExpress();
    memoryCheck();
    pingCheck();
};

//var failureRateCheck = function () {
//	new cronJob({
//		cronTime: "0 */3 * * * *",
//		onTick: function () {
//			dispatcher.applyToAllPhantomInstances(function (phantom) {
//				phantom.checkFailureRate();
//			});
//		},
//		start: true
//	});
//}

var pingCheck = function () {
    new cronJob({
        cronTime: "0 */3 * * * *",
        onTick: function () {
            _pingCheck();
        },
        start: true
    });
    var times = 3;
    var _pingCheck = function () {
        logger.info("Ping check....");

    }
    var _ping = function (times1, phantom) {
        times1--;

    }
}



exports.restartExpress = function (message) {
    serverStatus.insertExpressLog("restart", message || "server was restarted manually")
        .finally(_foreverRestart);
};

function monitorForExpress() {
    new cronJob({
        cronTime: "0 0 */6 * * *",
        onTick: function () {
            logger.warn("follow cron job ,will restart express server");
            serverStatus.insertExpressLog("restart", "server was started by cron job at " + new Date().toUTCString())
                .finally(_foreverRestart);
        },
        start: true
    });
}

function _foreverRestart() {
    process.kill(process.pid, 'SIGHUP');
}


exports.processUsage = function (pid) {
    return new Promise(function (resolve, reject) {
        pusage.stat(process.pid, function (err, usage) {
            usage.memory = usage.memory / (1024 * 1024);
            usage.totalMemory = parseInt(os.totalmem()) / (1024 * 1024);
            usage.cpu = usage.cpu / 100;
            resolve(usage);
        })
    })
}
