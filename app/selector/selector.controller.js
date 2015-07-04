/**
 * Created by Shawn Liu on 15-6-11.
 */
'use strict'
var Error = require("../../components/errors");
var logger = require("node-config-logger").getLogger("app/selector/selector.controller.js");
var Promise = require("bluebird");
var selectorService = require("./selector.service");
var retailerScript = require("../../components/crawler/retailers");
exports.query = function (req, res) {
    var locale = req.params.locale;
    var retailer = req.params.retailer;
    var flag = true;
    if (retailer) {
        if (!locale) {
            flag = false;
        }
    }
    if (!flag) {
        Error[400](req, res, "locale is required when specified retailer");
    } else {
        selectorService.query(req.params.locale, req.params.retailer)
            .then(function (list) {
                //if (!list || list.length === 0) {
                //    var errorMessage = "";
                //    if (locale && !retailer) {
                //        errorMessage = "this is no retailer in locale '" + locale + "'";
                //    }
                //    if (locale && retailer) {
                //        errorMessage = "unknown retailer '" + retailer + "' in locale '" + locale + "'";
                //    }
                //
                //    if (!locale && !retailer) {
                //        errorMessage = "this is no retailers in db";
                //    }
                //    Error[400](req, res, errorMessage);
                //} else {
                if (retailer) {
                    list = list[0];
                }
                res.json(list);
                //}
            })
            .catch(function (err) {
                Error[500](req, res, err.message || err);
            })
    }

}

exports.upsert = function (req, res) {
    var postBody = req.body;
    var locale = postBody.locale;
    var retailer = postBody.retailer;
    if (locale && retailer) {
        selectorService.update(locale, retailer, req.body)
            .then(function (t) {
                res.json(t);
            })
            .catch(function (err) {
                Error[500](req, res, err.message || err);
            })

    } else {
        Error[400](req, res, "both locale and retailer is required");
    }
}

//var postBody = {
//    "locale":"en_gb",
//    "retailers":[]
//}
exports.disableRetailer = function (req, res) {
    var body = req.body;
    if (body.locale && body.retailers) {
        selectorService.changeRetailerStatus(body.locale, body.retailers)
            .then(function (t) {
                res.json(t);
            })
            .catch(function (err) {
                Error[500](req, res, err.message || err);
            })
    } else {
        Error[400](req, res, "both locale and retailers are required");
    }
}

exports.getById = function (req, res) {
    var id = req.params.id;
    if (id) {
        selectorService.getById(id)
            .then(function (list) {
                if (list && list.length > 0) {
                    list = list[0];
                } else {
                    list = null;
                }
                res.json(list);
            })
            .catch(function (err) {
                Error[500](req, res, err.message || err);
            })
    } else {
        Error[400](req, res, "id is required");
    }
}

exports.template = function (req, res) {
    return retailerScript.getStandardSelector()
        .then(function (obj) {
            res.json(obj);
        })
        .catch(function (err) {
            Error[500](req, res, err.message || err);
        });

}