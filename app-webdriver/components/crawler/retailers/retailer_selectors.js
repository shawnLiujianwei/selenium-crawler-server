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
                        "selectorType": "css",
                        "content": '#itemDetails > div.add-holder.pharmRestricted-holder > p.prod-price > span.prod-price-inner',
                        "field": "price_now",
                        "scrapeType": "text"
                    },
                    {
                        "selectorType": "css",
                        "content": "#itemDetails > h1",
                        "field": "name",
                        "scrapeType": "text"
                    }
                ]
            }, {
                "domain": "tesco.com",
                "id": "groceries.tesco.com",
                "selectors": [
                    {
                        "selectorType": "css",
                        "content": 'span.linePrice',
                        "field": "price_now",
                        "scrapeType": "text"
                    },
                    {
                        "selectorType": "css",
                        "content": "div.desc > h1 > span",
                        "field": "name",
                        "scrapeType": "text"
                    }, {
                        "selectorType": "css",
                        "content": "div.noStock p.unavailableMsg",
                        "field": "oos",
                        "scrapeType": "text"
                    }
                ]
            }
            , {
                "domain": "sainsburys.co.uk",
                "id": "groceries.sainsburys.co.uk",
                "selectors": [
                    {
                        "selectorType": "css",
                        "content": '#content > div.section.productContent > div.mainProductInfoWrapper > div > div.productSummary > div.promotion > p > a',
                        "field": "price_now",
                        "scrapeType": "text"
                    },
                    {
                        "selectorType": "css",
                        "content": "#content > div.section.productContent > div.mainProductInfoWrapper > div > div.productSummary > h1",
                        "field": "name",
                        "scrapeType": "text"
                    }, {
                        "selectorType": "css",
                        "content": "div.noStock p.unavailableMsg",
                        "field": "oos",
                        "scrapeType": "text"
                    }
                ]
            }, {
                "domain": "waitrose.com",
                "id": "waitrose.com",
                "selectors": [
                    {
                        "selectorType": "css",
                        "content": 'p.price > strong',
                        "field": "price_now",
                        "scrapeType": "text"
                    },
                    {
                        "selectorType": "css",
                        "content": "div.l-content > h1 > em",
                        "field": "name",
                        "scrapeType": "text"
                    }
                ]
            }
        ]
    }
]