var config = {
    www: {},
    event: {}
};

config.appName = "my-app";

config.www.port = process.env.PORT || '443';

config.whitelist = [];

config.event.port = 4000;

config.event.token = "";

module.exports = config;