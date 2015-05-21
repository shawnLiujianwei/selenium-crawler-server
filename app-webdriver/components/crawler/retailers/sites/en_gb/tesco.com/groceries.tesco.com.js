/**
 * Created by Shawn Liu on 2015/5/21.
 */
var Promise = require("bluebird");
function Retailer() {

}

Retailer.prototype.format = function (jsonResult) {
    jsonResult.test = "!"
    return Promise.resolve(jsonResult);
}

module.exports = new Retailer();
