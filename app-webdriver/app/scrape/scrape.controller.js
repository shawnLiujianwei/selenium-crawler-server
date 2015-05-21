/**
 * Created by Shawn Liu on 2015/5/18.
 */

//var crawler = require("../../components/crawler");
var Error = require("../../components/errors");
var productService = require("../../components/db/product");
var logger = require("node-config-logger").getLogger("app-webdriver/app/scrape/scrape.controller.js");
var Promise = require("bluebird");
var dispatcher = require("../../components/crawler/dispatcher");
var dotterUtil = require("../../../components/utils/dotterUtil");
//var body = {
//    "productURLs": [],//required
//    "locale": "",//required,
//    "retailer": "tesco.com",//optional
//    ##"expiration": 0//default is 0, use the cache 0 hour ago,
//    "browser":"phantomjs"// default is phantomjs , can choose chrome
//}
exports.scrape = function (req, res) {
    var body = req.body;
    if (body && body.productURLs && body.locale) {
        dispatcher.scrape("details", body.productURLs, body.locale)
            .then(function (re) {
                res.json(re);
            })
            .catch(function (err) {
                Error[500](req, res, err.message);
            })
    } else {
        Error[400](req, res, "both productURL")
    }
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
                    var chunks = dotterUtil.chunk(array,5);
                    Promise.map(chunks,function(items){
                        return dispatcher.scrape("details",items,"en_gb")
                    })
                        .then(function(list){
                            logger.info("Done test");
                        })
                        .catch(function(err){
                            logger.error(err);
                        })

                })


        })
}

