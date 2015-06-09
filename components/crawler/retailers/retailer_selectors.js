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
                "id": "waitrose.com",
                "domain": "http://www.waitrose.com",
                "config": {
                    "detail": {
                        "stock": {
                            "required": true,
                            "field": "stock",
                            "statusList": [
                                {
                                    "status": "in-stock",
                                    "order": 1,
                                    "selectors": [
                                        "p.price > strong"
                                    ],
                                    "scrape": {
                                        "type": "elementExist"
                                    }
                                },
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
                                    "status": "notfound",
                                    "order": 2,
                                    "selectors": [],
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
                                "selectors": ["div.l-content > p.price > strong"],
                                "scrape": {
                                    "type": "text"
                                }
                            },
                            {
                                "field": "price_was",
                                "requiredWhenStatusInclude": [],
                                "selectors": ["div > div.l-content > p.offer-container > a.oldPrice"],
                                "scrape": {
                                    "type": "text"
                                }
                            },
                            {
                                "field": "offer",
                                "requiredWhenStatusInclude": [],
                                "selectors": ["div > div.l-content > p.offer-container > a.offer:nth-child(1)"],
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
                                "selectors": ["div.product-detail div > div.l-content > h1"],
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
                                "selectors": ["div.products-grid div.m-product-cell div.m-product-details-container"],
                                "scrape": {
                                    "type": "text"
                                }
                            }, {
                                "field": "url",
                                "selectors": ["div.products-grid div.m-product-cell div.m-product-details-container > a"],
                                "scrape": {
                                    "type": "attribute",
                                    "attr": "href"
                                }
                            }
                        ],
                        "pagination": {
                            "required": false,
                            "type": "scroll"
                        }
                    }
                }
            }
        ]
    }
]