/**
 * Main application routes
 */

'use strict';
module.exports = function (app) {
    app.use("/", require("./app/scrape/index"));
    app.use("/log", require("./app/log"));
    //crawler.setupCrawlerServer();
};
