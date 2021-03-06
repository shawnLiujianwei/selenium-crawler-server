/**
 * Main application file
 */

'use strict';
var path = require("path");
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = path.join(__dirname, "./config");
var express = require('express');
var config = require('config');
var dispatcher = require("./components/crawler/dispatcher");
// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);
//var memwatch = require('memwatch');
//memwatch.on('leak', function(info) { console.info(info) });
// Start server
server.listen(config.listener.port, function () {
    console.log('Express server listening on %d, in %s mode', config.listener.port, app.get('env'));
});
dispatcher.initAllInstance();

//// Expose app
////module.exports = app;
//process.on("uncaugheException",function(err){
//    console.error(err);
//})