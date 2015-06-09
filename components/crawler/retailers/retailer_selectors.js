/**
 * Created by Shawn Liu on 2015/5/20.
 */

module.exports = [
    {
        "locale": "en_gb",
        "retailers": [
            {
                "id": "groceries.tesco.com",
                "domain": "http://www.tesco.com",
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
                                "selectors": ["div.zoomImage > a"],
                                "scrape": {
                                    "type": "attribute",
                                    "attr": "href"
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
                    "search": {
                        "info": [
                            {
                                "field": "name",
                                "selectors": ["ul.products.grid > li.product >div.desc>h2>a"],
                                "scrape": {
                                    "type": "text"
                                }
                            }, {
                                "field": "url",
                                "selectors": ["ul.products.grid > li.product >div.desc>h2>a"],
                                "scrape": {
                                    "type": "attribute",
                                    "attr": "href"
                                }
                            }
                        ],
                        "pagination": {
                            "required": false,
                            "type": "click",
                            "button": "#multipleAdd > div.bottom.controlsWrap.clearfix.hasSort > div.controlsBar > div.pagination > ul > li.nextWrap > p > a"
                        }
                    }
                }
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