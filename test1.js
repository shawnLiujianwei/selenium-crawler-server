/**
 * Created by liujianwei on 2015/5/22.
 */
var CrawlerInstance = require("./components/crawler/CrawlerInstance");

var serverURL = "http://localhost:4141/wd/hub";
var type = "phantomjs";
var port = "4141";

var crawler = new CrawlerInstance(serverURL, type, port);
var selectorConfig = {
    "domain": "tesco.com",
    "id": "groceries.tesco.com",
    "selectors": [
        {
            "selectorType": "css",
            "content": ['span.linePrice'],
            "field": "price_now",
            "scrapeType": {
                "type": "text"
            }
        },
        {
            "selectorType": "css",
            "content": ["div.desc > h1 > span"],
            "field": "name",
            "scrapeType": {
                "type": "text"
            }
        }, {
            "selectorType": "css",
            "content": ["div.noStock p.unavailableMsg"],
            "field": "stock",
            "scrapeType": {
                "type": "text"
            }
        }, {
            "selectorType": "css",
            "content": ["div.descriptionDetails > div.desc > div > div > div > a > em"],
            "field": "offer",
            "scrapeType": {
                "type": "text"
            }
        }
    ]
};
var job = {
    productURL: "http://www.tesco.com/groceries/product/details/?id=259376209",
    method: "details",
    browser: "phantomjs"
}

crawler.request(job, selectorConfig)
    .then(function (result) {
        console.log(result);
    })
    .catch(function (err) {
        console.error(err);
    })