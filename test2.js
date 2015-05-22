/**
 * Created by liujianwei on 2015/5/22.
 */
var async = require("async");
var webdriverIO = require('webdriverio');
var ErrorHandler = webdriverIO.ErrorHandler;
var Promise = require("bluebird");
var client = webdriverIO
    .remote({
        desiredCapabilities: {
            browserName: 'phantomjs'
        },
        port: 4141
    })
var selectors = [
    {
        "selectorType": "css",
        "content": ['div.productPricingInformation > div.productPrice > div > div > div.productNowPrice > div > span'],
        "field": "price_now",
        "scrapeType": "text"
    }, {
        "selectorType": "css",
        "content": ["d111iv.productPricingInformation > div.productPrice > div > div > div.productWasPrice > div > span"],
        "field": "price_was",
        "scrapeType": "text"
    },
    {
        "selectorType": "css",
        "content": ["#header > span > h1 > span"],
        "field": "name",
        "scrapeType": "text"
    }, {
        "selectorType": "css",
        "content": ["div.productPricingInformation > div.productPrice > div > div > div.productSavePrice"],
        "field": "offer",
        "scrapeType": "text"
    }, {
        "selectorType": "css",
        "content": ["div.stockMessaging.inStock > span.indicator"],
        "field": "stock",
        "scrapeType": "text"
    }
];

client.init(function (err, data) {
    //console.log(err)
    //return Promise.reject("1111111111")
})
    .then(function () {
        console.log(1111);
        return client.url('http://www.very.co.uk/samsung-wb50f-16-1mega111pixel-digital-smart-camera/1363301973.prd')
            .catch(function (err) {

            })
    })
    .then(function () {
        console.log(222);
        selectors.forEach(function (se) {
            return _getMore(se)
        })
        //return Promise.resolve()
    })
    .then(function () {
        console.log(333);
        return client.end()
    })
    .catch(function (err) {
        // console.error(err)
    })
    .finally(function (err) {
        console.log("Done")
    })

process.on("uncaughtException", function (err) {
    console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
    console.error(err)
})
//http://www.very.co.uk/samsung-wb1100f-162-megapixel-35x-zoom-smart-bridge-camera/1363302664.prd?crossSellType=RR_Pzone1


//selectors.forEach(function (se) {
//
//    //_getMore(se);
//
//})

function _getMore(selector) {
    var csses = selector.content;
    var result = {};
    result[selector.field] = [];
    async.until(function isDone() {
        return csses.length === 0;
    }, function next(callback) {
        var css = csses.shift();
        client.getText(css,function(err,data){
            console.log(data);
            callback()
        })
            //.then(function (text) {
            //    result[selector.field].push(text);
            //    callback()
            //})
            //.catch(function (err) {
            //    console.log("fffffffffffffffff");
            //    callback()
            //})
        //.finally(function () {
        //    callback()
        //})
    }, function done() {
        console.log(result);
    })

}


client.on("error", function (err, msg) {
    console.error(err);
    console.log("=================");
    console.error(msg);
})

//client.end();