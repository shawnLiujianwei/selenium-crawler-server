/**
 * Created by Shawn Liu on 15-5-15.
 */

var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("components/crawler/retailer.js");
var _ = require("lodash");
var urlParser = require("url");
var retailerSelectors = require("./retailer_selectors");
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
