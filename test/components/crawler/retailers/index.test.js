/**
 * Created by Shawn Liu on 2015/5/21.
 */

var expect = require('chai').expect;
var RetailerObject = require("../../../../components/crawler/retailers");

describe("Test components/crawler/retailers/index.js", function () {

    it("#format() format result with oos selector error", function (done) {
        var result = {
            status: false,
            productURL: 'http://www.tesco.com/groceries/Product/Details/?id=273797773',
            price_now: '£1.37',
            name: 'Carex Handgel Original 50Ml',
            updateDate: new Date(),
            "errors": [
                {
                    "message": "no such element",
                    "code": 7,
                    "selector": {
                        selectorType: 'css',
                        content: 'div.noStock p.un',
                        field: 'oos',
                        scrapeType: 'text'
                    }
                }
            ]
        };
        var retailerScript = new RetailerObject(result.productURL, "en_gb");
        retailerScript.format(result)
            .then(function (t) {
                console.log(t);
            })
            .catch(function (err) {
                console.error(err);
            })
            .finally(function () {
                done();
            })
    });
    it.only("Get retailer config", function (done) {
        var url = "http://www.tesco.com/groceries/Product/Details/?id=273797773";
        var retailerScript = new RetailerObject(url, "en_gb");
        retailerScript.getSelector()
            .then(function (config) {
                expect(config.id).equal("groceries.tesco.com")
            })
            .catch(function (err) {
                console.error(err);
            })
            .finally(function () {
                done();
            })

    })
})