/**
 * Created by Shawn Liu on 2015/5/20.
 */
var ScrapeQueue = require("./ScrapeQueue");
var Promise = require("bluebird");
var logger = require("node-config-logger").getLogger("app-webdriver/components/crawler/CrawlerInstance.js");
function CrawlerInstance(serverURL) {
    this.server = serverURL;
    this.id = serverURL;
    this.queue = new ScrapeQueue(this, {
        id: this.server,
        maxRetries: 3
    });
}

CrawlerInstance.prototype.request = function (job, selectorConfig) {
    return _scrape(job.productURL, selectorConfig.selectors, job.browser).bind(this);
}

function _scrape(productURL, selectors, browser) {
    var jsonResult = {
        "status": true,
        "errors": [],
        "productURL": productURL
    };
    return new Promise(function (resolve, reject) {
        if (!browser) {
            browser = "phantomjs";
        }
        try {
            if (_checkValidBrowser(browser)) {
                var driver = new webdriver.Builder()
                    .forBrowser(browser)
                    .usingServer(this.server)
                    .build();
                driver.get(productURL);

                async.until(function isDone() {
                    return selectors.length === 0;
                }, function next(callback) {
                    var selector = selectors.shift();
                    var byC = "";
                    if (selector.selectorType === "css") {
                        byC = By.css(selector.content);
                    } else {
                        byC = By.xpath(selector.content);
                    }
                    var element = driver.findElement(byC);
                    element.getText()
                        .then(function (content) {
                            jsonResult[selector.field] = content;
                            callback()
                        }, function onError(err) {
                            //logger.error(err.message);
                            jsonResult.status = false;
                            jsonResult.errors.push({
                                "selector": selector.field,
                                "message": err.message
                            });
                            callback();
                        })
                }, function done() {
                    driver.quit()
                        .then(function () {
                            jsonResult.updateDate = new Date();
                            if (jsonResult.oos) {
                                jsonResult.status = true;
                                jsonResult.stock = "out-of-stock";
                                delete jsonResult.errors;
                            } else if (_onlyOOSError(jsonResult.errors)) {
                                jsonResult.status = true;
                                jsonResult.stock = "in-stock";
                                delete jsonResult.errors;
                            }
                            resolve(jsonResult);
                        })
                })

            } else {
                logger.error("Invalid browser '%s'", browser);
                jsonResult.errors.push({
                    "message": "Invalid browser '" + browser + "'"
                })
                resolve(jsonResult);
            }
        } catch (err) {
            logger.error(err);
            jsonResult.errors.push({
                "message": err.message || err
            })
            resolve(jsonResult);
        }
    })
}

function _onlyOOSError(errors) {
    return !errors ? true : (errors.length === 1 && errors[0].selector === "oos")
}

function _checkValidBrowser(browser) {
    return true;
}

function writeScreenshot(data, name) {
    name = name || 'ss.png';
    var screenshotPath = path.join(__dirname, "");
    fs.writeFileSync(screenshotPath + name, data, 'base64');
};

module.exports = CrawlerInstance;