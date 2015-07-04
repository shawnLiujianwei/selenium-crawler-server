/**
 * Created by Shawn Liu on 15/7/4.
 */
var dispatcher = require("./components/crawler/dispatcher");
exports.handler = function (event, content) {
    //event = {
    //    "productURLs": ["http://www.tesco.com/groceries/product/details/?id=259376209",
    //        "http://www.tesco.com/groceries/product/details/?id=281866222",
    //        "http://www.tesco.com/groceries/product/details/?id=273331737",
    //        "http://www.tesco.com/groceries/product/details/?id=258549232"],
    //    "locale": "en_gb",
    //    "browser": "phantomjs",
    //    "expiration": 0
    //}

    console.log("begin");
    dispatcher.scrape("details", event.urls, event.locale, event.retailer, event.browser)
        .then(function (re) {
            console.log(re);
        })
        .catch(function (err) {
            console.log("Error");
            console.log(err);
        })
        .finally(function(){
            content.done();
        })
}