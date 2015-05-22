/**
 * Main application routes
 */

'use strict';
module.exports = function (app) {
    app.use("/scrape", require("./app/scrape/index"));
    app.use("/log", require("./app/log"));
    //crawler.setupCrawlerServer();
};
