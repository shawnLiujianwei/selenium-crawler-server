/**
 * Created by Shawn Liu on 15-5-17.
 */
var logger = require("node-config-logger").getLogger("components/db/cache.js");
var config = require("config");
var settings = config.mongo;
var Promise = require("bluebird");
var db = require("mongo-promise-bluebird").create({
    db: settings.db,
    host: settings.host,
    port: settings.port
});
var col = db.collection("selector");
module.exports = col;