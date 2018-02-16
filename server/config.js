var config = {
    www: {},
    routes: [
        {
            name: "oscars",
            token: "userToken",
            adminToken: "adminToken",
			adminPassword: "adminPassword",
			cryptoPassword: "cryptoPassword",
            socketioPortHttp: 4001,
			socketioPortHttps: 4002,
            userUrl: "https://site.com/oscars",
            email: {
                user: 'email@email.com',
                pass: 'emailPassword'
            }
        }
    ],
    whitelist: [
				"https://site.com",
				"site.com",
                ],
	recaptchaSecret: 'recaptchaSecret'
};

config.appName = "awards";

config.www.port = process.env.PORT || '443';

module.exports = config;