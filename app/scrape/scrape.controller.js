/**
 * Created by Shawn Liu on 2015/5/18.
 */

var crawler = require("../../components/crawler");
var Error = require("../../components/errors");
var productService = require("../../components/db/product");
var logger = require("node-config-logger").getLogger("app/scrape/scrape.controller.js");
var Promise = require("bluebird");
exports.scrape = function (req, res) {
    var body = req.body;

}

exports.test = function (req, res) {
    res.json({
        "message": "Begin to test"
    });
    _runTest();
}

function _runTest() {
    //url = "http://item.taobao.com/item.htm?spm=a217j.7695524.1998513388.3.g6nKdH&id=4050140491";
    return productService.query("tesco.com")
        .then(function (list) {
            return productService.query("wairtose.com")
                .then(function (list1) {
                    var array = [];
                    Array.prototype.push.apply(array, list);
                    Array.prototype.push.apply(array, list1);
                    Array.prototype.push.apply(array, array);
                    Array.prototype.push.apply(array, array);
                    Array.prototype.push.apply(array, array);
                    logger.warn("Totally got '%s' products", array.length);
                    return Promise.map(array, function (url) {
                        return crawler.priceSpider(url, "en_gb", null, "phantomjs")
                    })
                })


        })
}
