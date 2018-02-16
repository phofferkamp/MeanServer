require('console-stamp')(console);
var urlmon = require('url-monitor');
var emailHelper = require("./server/routes/email");

var serverUp = true;

function sendEmail(subject) {
	var mailOptions = {
	  to: ['email@email.com'],
	  subject: subject
	};
	
	var email = {
                user: 'email@email.com',
                pass: 'emailPassword'
            };

	emailHelper.send(email, mailOptions);
}
 
var website = new urlmon({
    url:'https://sitetomonitor.com', 
    interval: 5000,
    timeout: 3000
});
 
website.on('error', (data) => {
    // website.stop();
	
	if (serverUp) {
		serverUp = false;
		sendEmail("MEAN Server DOWN");
		console.log(data);
	}
})
 
website.on('available', (data) => {
	if (!serverUp) {
		serverUp = true;
		sendEmail("MEAN Server UP");
		console.log(data);
	}
})
 
website.on('unavailable', (data) => {
    // website.stop();

	if (serverUp) {
		serverUp = false;
		sendEmail("MEAN Server DOWN");
		console.log(data);
	}
})
 
website.start();
