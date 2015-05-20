/**
 * Created by Shawn Liu on 15-5-17.
 */
'use strict';
var logger = require("node-config-logger").getLogger("components/db/product.js");
var config = require("config");
var settings = config.mongo;
var Promise = require("bluebird");
var db = require("mongo-bluebird").create({
    db: "dotter_product",
    host: settings.host,
    port: settings.port
});
var col = db.collection("sku");

exports.query = function (retailer) {
    return col.find({
        "retailers.retailer_id":retailer
    })
        .then(function(list){
            var results = [];
            list.forEach(function(product){
                var tmp = product.retailers.filter(function(item){
                    return item.retailer_id === retailer && item.product_url && item.product_url.indexOf("/groceries/") !== -1;
                }).map(function(item){
                    return item.product_url;
                });
                Array.prototype.push.apply(results,tmp);
            })
            return results;
        })
}