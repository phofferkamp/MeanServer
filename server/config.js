var config = {
    www: {},
    event: {}
};

config.www.port = process.env.PORT || '3000';

config.whitelist = ["https://www4-dev.panduit.com", "http://localhost:4200"];

config.event.port = 4000;

module.exports = config;