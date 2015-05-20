/**
 * Main application routes
 */

'use strict';
var crawler = require("./components/crawler");
module.exports = function (app) {
    app.use("/api/scrape", require("./app/scrape"));
    app.use("/api/log", require("./app/log"));
    //crawler.setupCrawlerServer();
};
