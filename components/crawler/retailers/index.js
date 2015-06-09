/**
 * Created by Shawn Liu on 15-5-15.
 */

var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("components/crawler/retailers/index.js");
var _ = require("lodash");
var urlParser = require("url");
var retailerSelectors = require("./retailer_selectors");
var Path = require("path");
var fs = require("fs");
var validSubdomain = {
    "en_gb": {
        "groceries.asda.com": true,
        "direct.asda.com": true
    }
}
//exports.getSelector = function (productURL, locale, retailer) {
//    var url = "";
//    try {
//        url = productURL ? urlParser.parse(productURL) : null;
//        if (url) {
//            var domain = retailer || url.hostname.toLowerCase();
//            var comps = domain.split(".");
//            var tld = comps[comps.length - 1];
//            var nc = 2; // number of useful domain components
//            switch (tld) {
//                case "uk" :
//                    if (!locale) locale = "en_gb";
//                    nc = 3;
//                    break;
//
//                case "us" :
//                case "com" :
//                    if (!locale) locale = "en_us";
//                    break;
//
//                case "au" :
//                    if (!locale) locale = "en_au";
//                    nc = 3;
//                    break;
//
//                case "de" :
//                    if (!locale) locale = "de_de";
//                    break;
//
//                case "fr" :
//                    if (!locale) locale = "fr_fr";
//                    break;
//
//                case "es" :
//                    if (!locale) locale = "es_es";
//                    break;
//
//                default:
//                    if (!locale) locale = tld;
//            }
//
//            if (!retailer) {
//                // some retailer sub domains are actually meaningful
//                domain = comps.slice(-(nc + 1)).join(".");
//                if (!validSubdomain[locale] || !validSubdomain[locale][domain]) {
//                    domain = comps.slice(-nc).join(".");
//                }
//            }
//
//            var section = url.pathname.split("/")[1];
//            switch (domain) {
//                case "tesco.com" :
//                    section = (section === "direct") ? section : "groceries";
//                    section = section + "." + domain;
//                    domain = section;
//                    break;
//
//                case "sainsburys.co.uk" :
//                    // todo more precise comparison based on parsed url path
//                    if (productURL.indexOf("groceries") !== -1 || productURL.indexOf("webapp/wcs/stores/servlet/SearchDisplayView") !== -1) {
//                        section = "groceries." + domain;
//                    }
//                    domain = section;
//                    break;
//
//                default:
//
//            }
//            //resolve(domain);
//            var localeConfig = _.find(retailerSelectors, {"locale": locale});
//            if (!localeConfig) {
//                //reject("unknown locale '%s'", locale);
//                return Promise.reject({
//                    status: false,
//                    url: productURL,
//                    message: "unknown locale '" + locale + "'"
//                })
//            } else {
//                var retailer = _.find(localeConfig.retailers, {"id": domain});
//                if (!retailer) {
//                    // reject("unknown retailer '%s'", domain);
//                    return Promise.reject({
//                        status: false,
//                        url: productURL,
//                        message: "unknown retailer '" + domain + "'"
//                    })
//                } else {
//                    //resolve(_.cloneDeep(retailer));
//                    retailer.status = true;
//                    return Promise.resolve(_.cloneDeep(retailer))
//                }
//            }
//        } else {
//            logger.error("Product URL could not be parsed: " + productURL);
//            return Promise.reject({
//                status: false,
//                url: productURL,
//                message: "Product URL could not be parsed: " + productURL
//            });
//        }
//    } catch (e) {
//        logger.error("Failure while getting selectors for " + productURL + " : " + e);
//        return Promise.reject({
//            status: false,
//            url: productURL,
//            message: e
//        });
//    }
//}


function _extractInfo(productURL, locale, retailer) {
    var url = "";
    var path = [__dirname, "sites"];
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
            path.push(locale);
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
                    path.push.apply(path, [domain, (section + ".js")]);
                    domain = section;
                    break;

                case "sainsburys.co.uk" :
                    // todo more precise comparison based on parsed url path
                    if (productURL.indexOf("groceries") !== -1 || productURL.indexOf("webapp/wcs/stores/servlet/SearchDisplayView") !== -1) {
                        section = "groceries." + domain;
                    }
                    path.push.apply(path, (section.match("groceries")) ? [domain, (section + ".js")] : [domain + ".js"]);
                    domain = section;
                    break;

                default:

            }

            return new Promise(function (resolve, reject) {
                var filePath = Path.join.apply(null, path);
                fs.exists(filePath, function (exists) {
                    if (exists) {
                        //logger.debug("loaded retailer script " + filePath);
                        resolve({
                            status: true,
                            url: productURL,
                            retailerFile: filePath,
                            selectorId: domain
                        });

                    } else {
                        // disable reject, so that the promise can go on even there exist some retailer scripts not implemented.
                        resolve({
                            status: true,
                            url: productURL,
                            selectorId: domain
                        });
                    }
                });
            });
        }
    } catch (e) {
        return Promise.reject({
            status: false,
            message: e.message || e
        });
    }
}


function RetailerObject(productURL, locale, retailer) {
    this.productURL = productURL;
    this.locale = locale;
    this.retailer = retailer;
}

RetailerObject.prototype.getSelector = function () {
    var ro = this;
    return _extractInfo(ro.productURL, ro.locale, ro.retailer)
        .then(function (result) {
            var localeConfig = _.find(retailerSelectors, {"locale": ro.locale});
            if (!localeConfig) {
                //reject("unknown locale '%s'", locale);
                return Promise.reject({
                    status: false,
                    url: this.productURL,
                    message: "unknown locale '" + ro.locale + "'"
                })
            } else {
                var retailer = _.find(localeConfig.retailers, {"id": result.selectorId});
                if (!retailer) {
                    // reject("unknown retailer '%s'", domain);
                    return Promise.reject({
                        status: false,
                        url: this.productURL,
                        message: "unknown retailer '" + result.selectorId + "'"
                    })
                } else {
                    //resolve(_.cloneDeep(retailer));
                    retailer.status = true;
                    return Promise.resolve(_.cloneDeep(retailer))
                }
            }
        })
}

//{
//    "status": true,
//    "productURL": "http://www.tesco.com/groceries/product/details/?id=259376209",
//    "scraped": {
//        "stock": "in-stock",
//        "price_now": "￡4.00",
//        "offer": "3 for ￡10.00 or 2 for ￡7.00",
//        "title": "Tesco Pork And Pepper Kebabs 288G",
//        "image": "http://img.tesco.com/Groceries/pi/854/5051790705854/IDShot_225x225.jpg"
//},
//    "browser": "phantomjs",
//    "updateTime": "2015-06-09T02:18:34.827Z",
//    "_id": "55764cfe867698f820c2775c"
//}
//{
//    "status": true,
//    "stock": "out-of-stock",
//    "price_now": "16.90",
//    "title": "TRANSFORMERS 4 boosterpakke",
//    "image": "http://cdn.top-toy.com//~/media/Images/04/5/1/TRANSFORMERS-4-boosterpakke-042701-1101951.ashx?bc=Transparent&as=1&h=313&w=571",
//    "url": "http://www.toysrus.no/merker/transformers/transformers-4-boosterpakke?id=901352&vid=042701",
//    "updateTime": "Tue, 09 Jun 2015 02:21:01 GMT",
//    "script": "toysrus.no.js",
//    "time": "2015-06-09T02:21:05.048Z"
//}
RetailerObject.prototype.format = function (jsonObject) {
    //TODO now just format the v2 dataformat to v1 , later may need to remove
    var newJ = {};
    newJ.status = jsonObject.status;
    newJ.url = jsonObject.productURL;
    newJ.updateTime = jsonObject.updateTime.toUTCString();
    newJ.time = jsonObject.updateTime;
    var scraped = jsonObject.scraped;
    if (scraped && Object.keys(scraped).length > 0) {
        for (var key in scraped) {
            newJ[key] = scraped[key];
        }
    }
    if (!jsonObject.status && jsonObject.errors) {
        newJ.message = jsonObject.errors.toString();
    }
    return Promise.resolve(newJ)
    //return _extractInfo(this.productURL, this.locale, this.retailer)
    //    .then(function (result) {
    //        if (1 === 2 && result && result.retailerFile) {
    //            return require(result.retailerFile).format(jsonObject);
    //        } else {
    //            return _basicFormat(jsonObject);
    //        }
    //    })
}

//function _basicFormat(jsonResult) {
//    return new Promise(function (resolve, reject) {
//        jsonResult.updateDate = new Date();
//        var errors = jsonResult.errors;
//        var selectors = jsonResult.selectors;
//        if (jsonResult.stock) {
//            jsonResult.status = true;
//            var stockInfo = jsonResult.stock.toLowerCase();
//            var oosKeys = [
//                "not available",//groceries.tesco.com,
//                "out of stock",//very.co.uk
//                "unavailable"
//            ];
//            var inStockKeys = [
//                "in stock"
//            ]
//            if (_checkStock(oosKeys, stockInfo)) {
//                jsonResult.stock = "out-of-stock";
//            } else if (_checkStock(inStockKeys, stockInfo)) {
//                jsonResult.stock = "in-stock";
//            } else {
//                jsonResult.stock = "in-stock";
//            }
//            // delete jsonResult.errors;
//        } else if (_onlyOOSError(jsonResult.errors)) {
//            jsonResult.status = true;
//            jsonResult.stock = "in-stock";
//            delete jsonResult.errors;
//        } else {
//            jsonResult.unFormatted = true;
//        }
//        delete jsonResult.selectors;
//        resolve(jsonResult);
//    })
//}
//
//function _checkStock(array, str) {
//    return array.some(function (stockInfo) {
//        return str.indexOf(stockInfo) !== -1;
//    })
//}
//
//function _onlyOOSError(errors) {
//    logger.error(errors)
//    return !errors ? true : (errors.length === 1 && errors[0].selector && errors[0].selector.field === "oos")
//}


module.exports = RetailerObject;