/**
 * Created by liujianwei on 2015/5/22.
 */
var CrawlerInstance = require("./components/crawler/CrawlerInstance");

var serverURL = "http://localhost:4141/wd/hub";
var type = "phantomjs";
var port = "4142";

var crawler = new CrawlerInstance(serverURL, type, port);
var selectorConfig = {
    "id": "groceries.tesco.com",
    "domain": "tesco.com",
    "config": {
        "detail": {
            "stock": {
                "required": true,
                "field": "stock",
                "statusList": [
                    {
                        "status": "out-of-stock",
                        "order": 0,
                        "scrape": {
                            "type": "textInclude",
                            "keys": [
                                "not available"
                            ]
                        },
                        "selectors": [
                            " div.noStock div.descNotices p.unavailableMsg"
                        ]
                    },
                    {
                        "status": "in-stock",
                        "order": 1,
                        "selectors": [
                            ".descriptionDetails span.linePrice"
                        ],
                        "scrape": {
                            "type": "elementExist"
                        }
                    },
                    {
                        "status": "notfound",
                        "order": 2,
                        "selectors": [
                            "selector1"
                        ],
                        "scrape": {
                            "type": "textInclude",
                            "keys": []
                        }
                    }
                ]
            },
            "info": [
                {
                    "field": "price_now",
                    "requiredWhenStatusInclude": [
                        "in-stock"
                    ],
                    "selectors": [".descriptionDetails span.linePrice"],
                    "scrape": {
                        "type": "text"
                    }
                },
                {
                    "field": "price_was",
                    "requiredWhenStatusInclude": [],
                    "selectors": [],
                    "scrape": {
                        "type": "text"
                    }
                },
                {
                    "field": "offer",
                    "requiredWhenStatusInclude": [],
                    "selectors": ["div.desc > div > div > div > a > em"],
                    "scrape": {
                        "type": "text"
                    }
                },
                {
                    "field": "title",
                    "requiredWhenStatusInclude": [
                        "in-stock",
                        "out-of-stock"
                    ],
                    "selectors": ["#breadcrumbNav  li:nth-child(3)"],
                    "scrape": {
                        "type": "text"
                    }
                },
                {
                    "field": "image",
                    "requiredWhenStatusInclude": [
                        "in-stock",
                        "out-of-stock"
                    ],
                    "selectors": ["div.presentationWrapper > div > a > img"],
                    "scrape": {
                        "type": "attribute",
                        "attr": "src"
                    }
                },
                {
                    "field": "description",
                    "requiredWhenStatusInclude": ["ul.descriptionSection"],
                    "selectors": [],
                    "scrape": {
                        "type": "html"
                    }
                }
            ]
        },
        "search": {}
    }
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
        console.warn(err);
    })