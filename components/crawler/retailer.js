/**
 * Created by Shawn Liu on 15-5-15.
 */

var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("components/crawler/retailer.js");
var _ = require("lodash");
var urlParser = require("url");
var validSubdomain = {
    "en_gb": {
        "groceries.asda.com": true,
        "direct.asda.com": true
    }
}
exports.extractRetailerId = function (productURL, locale, retailer) {
    var url = "";
    try {
        url = productURL ? urlParser.parse(productURL) : null;
        if (url) {
            var domain = retailer || url.hostname.toLowerCase();
            var comps = domain.split(".");
            var tld = comps[comps.length - 1];
            var nc = 2; // number of useful domain components
            switch (tld) {
                case "uk" :
                    if (!locale) locale = "en_gb";
                    nc = 3;
                    break;

                case "us" :
                case "com" :
                    if (!locale) locale = "en_us";
                    break;

                case "au" :
                    if (!locale) locale = "en_au";
                    nc = 3;
                    break;

                case "de" :
                    if (!locale) locale = "de_de";
                    break;

                case "fr" :
                    if (!locale) locale = "fr_fr";
                    break;

                case "es" :
                    if (!locale) locale = "es_es";
                    break;

                default:
                    if (!locale) locale = tld;
            }

            if (!retailer) {
                // some retailer sub domains are actually meaningful
                domain = comps.slice(-(nc + 1)).join(".");
                if (!validSubdomain[locale] || !validSubdomain[locale][domain]) {
                    domain = comps.slice(-nc).join(".");
                }
            }

            var section = url.pathname.split("/")[1];
            switch (domain) {
                case "tesco.com" :
                    section = (section === "direct") ? section : "groceries";
                    section = section + "." + domain;
                    domain = section;
                    break;

                case "sainsburys.co.uk" :
                    // todo more precise comparison based on parsed url path
                    if (productURL.indexOf("groceries") !== -1 || productURL.indexOf("webapp/wcs/stores/servlet/SearchDisplayView") !== -1) {
                        section = "groceries." + domain;
                    }
                    domain = section;
                    break;

                default:

            }
            return Promise.resolve({
                "status": true,
                "retailerId": domain
            })
        } else {
            logger.error("Product URL could not be parsed: " + productURL);
            return Promise.resolve({
                status: false,
                url: productURL,
                message: "Product URL could not be parsed: " + productURL
            });
        }
    } catch (e) {
        logger.error("Failure while getting script for " + productURL + " : " + e);
        return Promise.resolve({
            status: false,
            url: productURL,
            message: e
        });
    }
}


exports.getSelector = function (productURL, locale, retailer) {
    var url = "";
    try {
        url = productURL ? urlParser.parse(productURL) : null;
        if (url) {
            var domain = retailer || url.hostname.toLowerCase();
            var comps = domain.split(".");
            var tld = comps[comps.length - 1];
            var nc = 2; // number of useful domain components
            switch (tld) {
                case "uk" :
                    if (!locale) locale = "en_gb";
                    nc = 3;
                    break;

                case "us" :
                case "com" :
                    if (!locale) locale = "en_us";
                    break;

                case "au" :
                    if (!locale) locale = "en_au";
                    nc = 3;
                    break;

                case "de" :
                    if (!locale) locale = "de_de";
                    break;

                case "fr" :
                    if (!locale) locale = "fr_fr";
                    break;

                case "es" :
                    if (!locale) locale = "es_es";
                    break;

                default:
                    if (!locale) locale = tld;
            }

            if (!retailer) {
                // some retailer sub domains are actually meaningful
                domain = comps.slice(-(nc + 1)).join(".");
                if (!validSubdomain[locale] || !validSubdomain[locale][domain]) {
                    domain = comps.slice(-nc).join(".");
                }
            }

            var section = url.pathname.split("/")[1];
            switch (domain) {
                case "tesco.com" :
                    section = (section === "direct") ? section : "groceries";
                    section = section + "." + domain;
                    domain = section;
                    break;

                case "sainsburys.co.uk" :
                    // todo more precise comparison based on parsed url path
                    if (productURL.indexOf("groceries") !== -1 || productURL.indexOf("webapp/wcs/stores/servlet/SearchDisplayView") !== -1) {
                        section = "groceries." + domain;
                    }
                    domain = section;
                    break;

                default:

            }
            //resolve(domain);
            var localeConfig = _.find(staticData, {"locale": locale});
            if (!localeConfig) {
                //reject("unknown locale '%s'", locale);
                return Promise.resolve({
                    status: false,
                    url: productURL,
                    message: "unknown locale '" + locale + "'"
                })
            } else {
                var retailer = _.find(localeConfig.retailers, {"id": domain});
                if (!retailer) {
                    // reject("unknown retailer '%s'", domain);
                    return Promise.resolve({
                        status: false,
                        url: productURL,
                        message: "unknown retailer '" + domain + "'"
                    })
                } else {
                    //resolve(_.cloneDeep(retailer));
                    retailer.status = true;
                    return Promise.resolve(_.cloneDeep(retailer))
                }
            }
        } else {
            logger.error("Product URL could not be parsed: " + productURL);
            return Promise.resolve({
                status: false,
                url: productURL,
                message: "Product URL could not be parsed: " + productURL
            });
        }
    } catch (e) {
        logger.error("Failure while getting script for " + productURL + " : " + e);
        return Promise.resolve({
            status: false,
            url: productURL,
            message: e
        });
    }
}

var staticData = [
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
    }, {
        "locale": "zh_cn",
        "retailers": [
            {
                "domain": "taobao.com",
                "id": "taobao.com",
                "selectors": [
                    {
                        "selectorType": "xpath",
                        "content": '//*[@id="J_PromoPriceNum"]',
                        "field": "price_now",
                        "scrapeType": "text"
                    }
                ]
            }
        ]
    }
]