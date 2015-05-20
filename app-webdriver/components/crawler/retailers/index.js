/**
 * Created by Shawn Liu on 15-5-15.
 */

var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("components/crawler/retailer.js");
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
            var localeConfig = _.find(retailerSelectors, {"locale": locale});
            if (!localeConfig) {
                //reject("unknown locale '%s'", locale);
                return Promise.reject({
                    status: false,
                    url: productURL,
                    message: "unknown locale '" + locale + "'"
                })
            } else {
                var retailer = _.find(localeConfig.retailers, {"id": domain});
                if (!retailer) {
                    // reject("unknown retailer '%s'", domain);
                    return Promise.reject({
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
            return Promise.reject({
                status: false,
                url: productURL,
                message: "Product URL could not be parsed: " + productURL
            });
        }
    } catch (e) {
        logger.error("Failure while getting selectors for " + productURL + " : " + e);
        return Promise.reject({
            status: false,
            url: productURL,
            message: e
        });
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

RetailerObject.prototype.format = function (jsonObject) {
    return _extractInfo(this.productURL, this.locale, this.retailer)
        .then(function (result) {
            if (result && result.retailerFile) {
                return require(result.retailerFile).format(jsonObject);
            } else {
                return _basicFormat(jsonObject);
            }
        })
}

function _basicFormat(jsonObject) {
    return new Promise(function(resolve,reject){
        resolve(jsonObject);
    })
}

module.exports = RetailerObject;