/**
 * Created by Shawn Liu on 15-5-15.
 */

var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("components/crawler/retailers/index.js");
var _ = require("lodash");
var urlParser = require("url");
var retailerSelectors = require("./retailer_selectors");
var selectorService = require("../../../app/selector/selector.service");
var Path = require("path");
var fs = require("fs");
var validSubdomain = {
    "en_gb": {
        "groceries.asda.com": true,
        "direct.asda.com": true
    }
}


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
                resolve({
                    status: true,
                    url: productURL,
                    retailer: domain
                });
                var filePath = Path.join.apply(null, path);
                //fs.exists(filePath, function (exists) {
                //    if (exists) {
                //        //logger.debug("loaded retailer script " + filePath);
                //        resolve({
                //            status: true,
                //            url: productURL,
                //            retailerFile: filePath,
                //            selectorId: domain
                //        });
                //
                //    } else {
                //        // disable reject, so that the promise can go on even there exist some retailer scripts not implemented.
                //        resolve({
                //            status: true,
                //            url: productURL,
                //            selectorId: domain
                //        });
                //    }
                //});
            });
        }
    } catch (e) {
        return Promise.reject({
            status: false,
            message: e.message || e
        });
    }
}


//function RetailerObject(productURL, locale, retailer) {
//    this.productURL = productURL;
//    this.locale = locale;
//    this.retailer = retailer;
//}
exports.getSelector = function (productURL, locale, retailer) {
    return _extractInfo(productURL, locale, retailer)
        .then(function (result) {
            if (result && result.status) {
                return selectorService.query(locale, retailer)
                    .then(function (list) {
                        if (list && list.length === 1) {
                            //list[0].status = true;
                            return {
                                "status": true,
                                "data": list[0]
                            };
                        } else {
                            logger.warn("there is no configuration for retailer '%s' in locale '%s'", retailer, locale);
                            return Promise.reject({
                                "status": false,
                                "message": "retailer '" + retailer + "' doesn't exist in locale '" + locale + "'"
                            })
                        }
                    })
                    .catch(function (err) {
                        logger.error(err);
                        return Promise.reject({
                            status: false,
                            message: err.message || err
                        })
                    })
            } else {

                var msg = "failed to get selector for retailer '" + retailer + "'";
                logger.error(msg, result.message);
                return Promise.reject(result);

            }
            //var localeConfig = _.find(retailerSelectors, {"locale": ro.locale});
            //if (!localeConfig) {
            //    //reject("unknown locale '%s'", locale);
            //    return Promise.reject({
            //        status: false,
            //        url: this.productURL,
            //        message: "unknown locale '" + ro.locale + "'"
            //    })
            //} else {
            //    var retailer = _.find(localeConfig.retailers, {"id": result.selectorId});
            //    if (!retailer) {
            //        // reject("unknown retailer '%s'", domain);
            //        return Promise.reject({
            //            status: false,
            //            url: this.productURL,
            //            message: "unknown retailer '" + result.selectorId + "'"
            //        })
            //    } else {
            //        //resolve(_.cloneDeep(retailer));
            //        retailer.status = true;
            //        return Promise.resolve(_.cloneDeep(retailer))
            //    }
            //}
        })
}
exports.format = function (jsonObject) {
    //TODO now just format the v2 dataformat to v1 , later may need to remove
    var newJ = {};
    newJ.status = jsonObject.status;
    newJ.url = jsonObject.productURL;
    newJ.updateTime = jsonObject.updateTime.toUTCString();
    newJ.time = jsonObject.updateTime;
    var scraped = jsonObject.scraped;
    if (scraped && (Object.keys(scraped).length > 0 || scraped.length > 0)) {
        if (!Array.isArray(scraped)) {
            for (var key in scraped) {
                newJ[key] = scraped[key];
            }
        } else {
            newJ.links = scraped;
        }

    }
    if (!jsonObject.status && jsonObject.errors) {
        newJ.message = jsonObject.errors.toString();
    }
    return Promise.resolve(newJ)
}

exports.getStandardSelector = function () {
    return new Promise(function (resolve, reject) {
        fs.readFile(Path.join(__dirname, "./design.json"), function (err, data) {
            if (err) {
                logger.error(err);
                reject();
            } else {
                resolve(JSON.parse(data.toString()));
            }
        })
    })
}
//module.exports = RetailerObject;