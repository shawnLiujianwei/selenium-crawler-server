/**
 * Main application file
 */

'use strict';
var path = require("path");
// Set default node environment to development

var express = require('express');
var config = require('config');
// Setup server
var app = express();
var server = require('http').createServer(app);
require('../config/express')(app);
require('./routes')(app);


// Start server
server.listen(config.listener.webdriverApp.port, function () {
    console.log('Express server listening on %d, in %s mode', config.listener.webdriverApp.port, app.get('env'));
});


// Expose app
//module.exports = app;
