var seleniumServer = require("selenium-hub-launcher");
var logger = require("log4js").getLogger("tttt.js");
var Process = require("child_process");
var command = [];
command.push("pm2 start");
command.push(seleniumServer.startupFile);
command.push("--name=phantomCluster11");
var cp = Process.exec(command.join(" "), function (err, data) {
});
cp.stdout.on('data', function (data) {
    logger.info(data.toString());
});
cp.stderr.on('data', function (data) {
    logger.error(data.toString());
});