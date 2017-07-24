var config = {
    www: {},
    event: {}
};

config.www.port = process.env.PORT || '443';

config.whitelist = ["http://www4-dev.panduit.com", "https://www4-dev.panduit.com", "http://localhost:4200"];

config.event.port = 4000;

config.event.token = "2556713538412c3153787a4a3528773d";

module.exports = config;