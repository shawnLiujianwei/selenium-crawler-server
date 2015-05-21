/**
 * Created by Shawn Liu on 2015/5/21.
 */
var expect = require('chai').expect;
var dispatcher = require("../../../../app-webdriver/components/crawler/dispatcher");
var logger = require("node-config-logger").getLogger("test/app-webdriver/components/crawler/dispatcher.js");
describe("Test app-webdriver/components/crawler/dispather.js", function () {

    before(function (done) {
        dispatcher.initAllInstance();
        done();
    });

    it("#scrape() scrape products", function (done) {
        var productURLs = ["http://www.tesco.com/groceries/Product/Details/?id=273797773",
            "http://www.tesco.com/groceries/product/details/?id=259376209"];
        var locale = "en_gb";
        dispatcher.scrape("details", productURLs, locale)
            .then(function (result) {
                logger.info(result);
            })
            .catch(function (err) {
                logger.error(err);
            })
            .finally(function () {
                done();
            })
    })
})