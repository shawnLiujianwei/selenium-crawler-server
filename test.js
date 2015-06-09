var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'chrome'
    },
    "port":4141
};
webdriverio
    .remote(options)
    .init()
    .url('http://www.baidu.com')
    .title(function (err, res) {
        console.log('Title was: ' + res.value);
    })
    .end();