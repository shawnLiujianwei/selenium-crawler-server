/**
 * Created by Shawn Liu on 15-5-17.
 */
'use strict';
var logger = require("node-config-logger").getLogger("components/db/errorLog.js");
var config = require("config");
var settings = config.mongo;
var Promise = require("bluebird");
var db = require("mongo-bluebird").create({
    db: settings.db,
    host: settings.host,
    port: settings.port
});
var col = db.collection("errorlog");
exports.insert = function (list) {
    return col.insert(list);
}

exports.query = function (filter) {
    return col.find(filter);
}