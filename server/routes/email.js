var email = {
  send: function(config, options) {
	var send = require('gmail-send')({
	  user: config.user,
	  pass: config.pass,
	  to:   options.to,
	  subject: options.subject,
	  html:    options.html
	});
	
	send({}, function (err, res) {
	  console.log('* [example 1.1] send() callback returned: err:', err, '; res:', res);
	});
  }
};

module.exports = email;