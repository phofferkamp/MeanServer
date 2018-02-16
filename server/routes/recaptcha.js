module.exports = function(recaptchaSecret) {
  var express = require('express');
  var router = express.Router();
  var rp = require('request-promise');
  
  router.post('/', (req, res, next) => {
	  var options = {
		method: 'POST',
		uri: 'https://www.google.com/recaptcha/api/siteverify',
		qs: {
		  secret: recaptchaSecret,
		  response: req.body.response
		},
		json: true
	  };

	  rp(options)
		.then(response => res.json(response))
		.catch(() => {});
  });
  
  return router;
};