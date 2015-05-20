/**
 * Error responses
 */

'use strict';
var logger = require("node-config-logger").getLogger("components/errors/index.js");

module.exports[404] = function pageNotFound(req, res) {
    _handleError(req, res, 404);
};

module.exports[500] = function serverError(req, res, msg) {
    _handleError(req, res, 500, msg);
}

module.exports[400] = function badRequest(req, res, msg) {
    _handleError(req, res, 400, msg);
}

module.exports[401] = function needAuthenticated(req, res, msg) {
    _handleError(req, res, 401, msg);
}

function _handleError(req, res, code, msg) {
    var viewFilePath = code + "";
    var result = {};
    if (msg) {
        if (typeof msg === "object") {
            result = msg;
        } else {
            //result.message = msg;
            result = {
                status: code,
                "message": msg
            }
        }
    }
    res.status(code);
    return res.json(result);
    //res.render(viewFilePath, function (err) {
    //    if (err) {
    //        return res.json(result, result.status);
    //    }
    //
    //    res.render(viewFilePath);
    //});
}
