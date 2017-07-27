var config = {
    www: {},
    routes: [
        {
            name: "event",
            token: "test",
            whitelist: [],
            socketioPort: 4000,
        }
    ]
};

config.appName = "my-app";

config.www.port = process.env.PORT || '443';

module.exports = config;