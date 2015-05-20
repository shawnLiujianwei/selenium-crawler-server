/**
 * Main application routes
 */

'use strict';
var router = express.Router();
var crawler = require("./crawler");
module.exports = function (app) {
    //app.use("/scrape", require("./app/scrape/index"));
    ////app.use("/api/log", require("./app/log"));
    //router.get("/driver/restart/type/:type/port/:port", function (req, res) {
    //
    //});
    crawler.setupCrawlerServer();
};
