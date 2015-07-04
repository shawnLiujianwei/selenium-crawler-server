/**
 * Created by Shawn Liu on 15-6-11.
 */
'use strict'
var logger = require("node-config-logger").getLogger("app/selector/selector.service.js");
var config = require("config");
var settings = config.mongo;
var Promise = require("bluebird");
var ObjectID = require("mongodb").ObjectID;
var db = require("mongo-promise-bluebird").create({
    db: settings.db,
    host: settings.host,
    port: settings.port
});
var col = db.collection("selector");
col.ensureIndex({locale: 1, retailer: 1}, {unique: true});
exports.query = function (locale, retailer) {
    var query = {};
    if (locale) {
        query.locale = locale;
    }
    if (retailer) {
        query.retailer = retailer;
    }
    return col.find(query)
}

exports.upsert = function (locale, retailer, data) {
    data.enable = true;
    data.updateTime = new Date();
    return col.upsert({
        "locale": locale,
        "retailer": retailer
    }, data);
}

exports.changeRetailerStatus = function (locale, retailers) {
    return col.update({
        "$and": [
            {
                "locale": locale
            },
            {
                "retailer": {
                    "$in": retailers
                }
            }
        ]
    }, {
        "$set": {
            "enable": false,
            "updateTime": new Date()
        }
    });
}

exports.getById = function (id) {
    return col.find({
        "_id": new ObjectID(id)
    })
}