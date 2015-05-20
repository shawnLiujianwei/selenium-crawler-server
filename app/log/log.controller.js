/**
 * Created by Shawn Liu on 2015/5/18.
 */
var cacheService = require("../../components/db/cache");
var logger = require("node-config-logger").getLogger("app/log/log.controller.js");
var Error = require("../../components/errors");
exports.summary = function (req, res) {
    var result = {
        "success": [],
        "error": []
    };
    cacheService.query({
        "status": false
    })
        .then(function (list) {
            result.error = list;
            return cacheService.query({status: true})
        })
        .then(function (list) {
            result.success = list;
            res.json(result);
        })
        .catch(function (err) {
            logger.error(err);
            Error[500](req, res, err);
        })
}

exports.clean = function(req,res) {
    cacheService.remove({})
        .then(function(list){
            res.json(list);
        })
        .catch(function (err) {
            logger.error(err);
            Error[500](req, res, err);
        })
}