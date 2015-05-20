/**
 * Express configuration
 */

'use strict';

var express = require('express');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var session = require('express-session')
module.exports = function (app) {
    app.use(cookieParser("appsecret"));
    //app.use(function (req, res, next) {
    //    req.session._garbage = Date();
    //    req.session.touch();
    //    next();
    //});
    app.use(session({
        secret: 'appsecret',
        resave: true,
        saveUninitialized: true
    }));
    app.use(compression());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(methodOverride());
    if (process.env.NODE_ENV === 'development') {
        // only use in development
        app.use(errorHandler())
    }

};
