/**
 * Created by Shawn Liu on 2015/5/20.
 */

module.exports = [
    {
        "locale": "en_gb",
        "retailers": [
            {
                "domain": "groceries.asda",
                "id": "groceries.asda",
                "selectors": [
                    {
                        "content": ['#itemDetails > div.add-holder.pharmRestricted-holder > p.prod-price > span.prod-price-inner'],
                        "field": "price_now",
                        "scrapeType": {
                            "type": "text"
                        }
                    },
                    {
                        "content": ["#itemDetails > h1"],
                        "field": "name",
                        "scrapeType": {
                            "type": "text"
                        }
                    }
                ]
            }, {
                "domain": "tesco.com",
                "id": "groceries.tesco.com",
                "selectors": [
                    {
                        "content": ['.descriptionDetails span.linePrice'],
                        "field": "price_now",
                        "scrapeType": {
                            "type": "text"
                        }
                    },
                    {
                        "content": ["div.desc > h1 > span"],
                        "field": "name",
                        "scrapeType": {
                            "type": "text"
                        }
                    }, {
                        "content": ["div.noStock p.unavailableMsg"],
                        "field": "stock",
                        "scrapeType": {
                            "type": "text"
                        }
                    }, {
                        "content": ["div.descriptionDetails > div.desc > div > div > div > a > em"],
                        "field": "offer",
                        "scrapeType": {
                            "type": "text"
                        }
                    }
                ]
            }
            , {
                "domain": "sainsburys.co.uk",
                "id": "groceries.sainsburys.co.uk",
                "selectors": [
                    {
                        "content": ['#content > div.section.productContent > div.mainProductInfoWrapper > div > div.productSummary > div.promotion > p > a'],
                        "field": "price_now",
                        "scrapeType": {
                            "type": "text"
                        }
                    },
                    {
                        "content": ["#content > div.section.productContent > div.mainProductInfoWrapper > div > div.productSummary > h1"],
                        "field": "name",
                        "scrapeType": {
                            "type": "text"
                        }
                    }, {
                        "content": ["div.noStock p.unavailableMsg"],
                        "field": "stock",
                        "scrapeType": {
                            "type": "text"
                        }
                    }
                ]
            }, {
                "domain": "waitrose.com",
                "id": "waitrose.com",
                "selectors": [
                    {
                        "content": 'p.price > strong',
                        "field": "price_now",
                        "scrapeType": {
                            "type": "text"
                        }
                    }, {
                        "content": ["div > div.l-content > p.offer-container > a.oldPrice"],
                        "field": "price_was",
                        "scrapeType": {
                            "type": "text"
                        }
                    },
                    {
                        "content": ["div.l-content > h1 > em"],
                        "field": "name",
                        "scrapeType": {
                            "type": "text"
                        }
                    }, {
                        "content": ["div > div.l-content > p.offer-container > a.offer"],
                        "field": "offer",
                        "scrapeType": {
                            "type": "text"
                        }
                    }
                ]
            }, {
                "domain": "very.co.uk",
                "id": "very.co.uk",
                "selectors": [
                    {
                        "content": ['div.productPricingInformation > div.productPrice > div > div > div.productNowPrice > div > span'],
                        "field": "price_now",
                        "scrapeType": {
                            "type": "text"
                        }
                    }, {
                        "content": ["div.productPricingInformation > div.productPrice > div > div > div.productWasPrice > div > span"],
                        "field": "price_was",
                        "scrapeType": {
                            "type": "text"
                        }
                    },
                    {
                        "content": ["#header > span > h1 > span"],
                        "field": "name",
                        "scrapeType": {
                            "type": "text"
                        }
                    }, {
                        "content": ["div.productPricingInformation > div.productPrice > div > div > div.productSavePrice"],
                        "field": "offer",
                        "scrapeType": {
                            "type": "text"
                        }
                    }, {
                        "content": ["div.stockMessaging.inStock > span.indicator"],
                        "field": "stock",
                        "scrapeType": {
                            "type": "text"
                        }
                    }
                ]
            }
        ]
    }
]