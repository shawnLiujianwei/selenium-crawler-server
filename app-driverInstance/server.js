/**
 * Main application file
 */

'use strict';
var path = require("path");
// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.NODE_CONFIG_DIR = path.join(__dirname, "../config");
var express = require('express');
var config = require('config');
// Setup server
var app = express();
var server = require('http').createServer(app);
require('../config/express')(app);
require('./routes')(app);

var startup = require("./startup");

// Start server
server.listen(config.listener.driverInstanceApp.port, function () {
    console.log('Express server listening on %d, in %s mode', config.listener.driverInstanceApp.port, app.get('env'));
    startup.setupCrawlerServer();
});

// Expose app
//module.exports = app;
