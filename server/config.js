var config = {
    www: {},
    routes: [
        {
            name: "event",
            token: "test",
            socketioPort: 4000,
        }
    ],
    whitelist: []
};

config.appName = "my-app";

config.www.port = process.env.PORT || '443';

module.exports = config;