/**
 * Created by Shawn Liu on 15-5-16.
 */
var selenium = require('selenium-standalone');
var logger = require("node-config-logger").getLogger("components/selenium-server/install.js");

selenium.install({
    // check for more recent versions of selenium here:
    // http://selenium-release.storage.googleapis.com/index.html
    version: '2.45.0',
    baseURL: 'http://selenium-release.storage.googleapis.com',
    drivers: {
        chrome: {
            // check for more recent versions of chrome driver here:
            // http://chromedriver.storage.googleapis.com/index.html
            version: '2.15',
            arch: process.arch,
            baseURL: 'http://chromedriver.storage.googleapis.com'
        }
    },
    logger: function (message) {
        logger.debug(message)
    },
    progressCb: function (totalLength, progressLength, chunkLength) {
        logger.info("Proceed '%s' of '%s' ", progressLength, totalLength);
    }
}, function installDone() {
    logger.info("Install success");
});
