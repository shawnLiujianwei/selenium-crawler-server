/**
 * Created by Shawn Liu on 15-5-22.
 */
var script = require("./index");
script.start();
process.on("uncaughtException", function (err) {
    logger.error("=====components/seleniumInstance/SeleniumHubInstance=========")
    logger.error(err);
    logger.error("=====components/seleniumInstance/SeleniumHubInstance=========")
})