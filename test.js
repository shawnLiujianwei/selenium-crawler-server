/**
 * Created by Shawn Liu on 15-5-21.
 */
var webdriver = require('selenium-webdriver'),
    By = require('selenium-webdriver').By,
    until = require('selenium-webdriver').until;
var driver = new webdriver.Builder()
    .forBrowser('phantomjs')
    .usingServer('http://127.0.0.1:4444/wd/hub')
    .build();

//var url = "http://www.very.co.uk/american-charcoal-grill/1458057504.prd"
var url = "http://www.very.co.uk/samsung-wb1100f-162-megapixel-35x-zoom-smart-bridge-camera/1363302664.prd?crossSellType=RR_Pzone1";
driver.get(url);
driver.findElement(By.css("div.productPricingInformation > div.productPrice > div > div > div.productNowPrice > div > span"))
    .getText()
    .then(function (data) {
        console.log(data);
    }, function onError(err) {
        console.error(err);
    })

driver.findElement(By.css("#header > span > h1 > span"))
    .getText()
    .then(function (data) {
        console.log(data);
    }, function onError(err) {
        console.error(err);
    })