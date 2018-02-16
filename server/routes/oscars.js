/* global ObjectId */

module.exports = function(routeConfig, whitelist) {
  var express = require('express');
  var router = express.Router();
  var app = express();

  var cors = require('cors');

  var corsOptions = {
    origin: function(origin, callback) {
      // console.log("gg origin:", origin);
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      }
      else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  };

  app.use(cors(corsOptions));

  var AwardsUser = require('../models/AwardsUser.js');
  var AwardsGame = require('../models/AwardsGame.js');
  var AwardsCategory = require('../models/AwardsCategory.js');
  var AwardsConfig = require('../models/AwardsConfig.js');
  var Feedback = require('../models/Feedback.js');

  // socket ioHttp
  var http = require('http');

  var serverHttp = http.createServer(app).listen(routeConfig.socketioPortHttp);

  var ioHttp = require('socket.io')(serverHttp);

  
    // socket ioHttps
  var https = require('https');
  
    var fs = require('fs');

  var options = {
    key: fs.readFileSync('/etc/letsencrypt/live/www.site.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/www.site.com/fullchain.pem')
  };
  
	var serverHttps = https.createServer(options, app).listen(routeConfig.socketioPortHttps);

	var ioHttps = require('socket.io')(serverHttps);
	
	ioHttp.on('connection', function(socket) {
    socket.on('gg-admin-updated', function() {
      ioHttp.emit('gg-update');
      ioHttps.emit('gg-update');
    });
  });
  ioHttps.on('connection', function(socket) {
    socket.on('gg-admin-updated', function() {
      ioHttps.emit('gg-update');
      ioHttp.emit('gg-update');
    });
  });
  

  setInterval(() => {
    getConfig()
      .then(function(config) {
        if (config.autoStart === "true" && config.gameMode === "before" && new Date() > config.gameStart) {
          config.gameMode = "during";

          updateConfig(config);
        }
      });
  }, 1000);
  
  var crypto = require('crypto');
  var cipher_algorithm = 'aes-256-ctr';

  var generatePassword = require("password-generator");

  var emailHelper = require("./email");

  function validateToken(headers) {
	  if (whitelist.indexOf(headers.host) !== -1) {
        return headers.token === routeConfig.token;
      } else {
		  return false;
	  }
  }

  function validateAdminToken(headers) {
	  if (whitelist.indexOf(headers.host) !== -1) {
		return headers.token === routeConfig.adminToken;
      } else {
		  return false;
	  }
  }
  
  function encrypt(text){
	  var cipher = crypto.createCipher(cipher_algorithm, routeConfig.cryptoPassword)
	  var crypted = cipher.update(text, 'utf8', 'hex')
	  crypted += cipher.final('hex');
	  return crypted;
	}

  function getConfig(next) {
    return AwardsConfig.findOne({ game: routeConfig.name }, function(err, config) {
      if (err && next) return next(err);
      return config;
    });
  }

  function updateConfig(config, next) {
    return AwardsConfig.findOneAndUpdate({ game: routeConfig.name }, config).exec(function(err, config) {
      if (err && next) return next(err);
      return config;
    });
  }

  function getUserEmail(req, next, allFields) {
    if (allFields) {
      return AwardsUser.findOne({ email: req.params.email.toLowerCase() }, function(err, user) {
        if (err) return next(err);
        return user;
      });
    }
    else {
      return AwardsUser.findOne({ email: req.params.email.toLowerCase() }, 'name score', function(err, user) {
        if (err) return next(err);
        return user;
      });
    }
  }
  
  function findUserById(id, next) {
	  return AwardsUser.findById(req.params.id, function(err, user) {
		  if (err) return next(err);
          return user;
      });
  }

  function updateUser(id, user, next) {
    return AwardsUser.findByIdAndUpdate(id, user).exec(function(err, user) {
      if (err) return next(err);
      return user;
    });
  }
  
  function updateGame(id, game, next) {
    return AwardsGame.findByIdAndUpdate(id, game).exec(function(err, game) {
      if (err) return next(err);
      return game;
    });
  }

  router.get('/category', function(req, res, next) {
    if (validateToken(req.headers)) {
      AwardsCategory.find({ game: routeConfig.name }).sort('index').exec(function(err, categories) {
        if (err) return next(err);
        res.json(categories);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.post('/category', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
		var newCategory = req.body;
		newCategory.game = routeConfig.name;
      AwardsCategory.create(newCategory, function(err, category) {
        if (err) return next(err);
        res.json(category);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.put('/category/:id', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
      AwardsCategory.findByIdAndUpdate(req.params.id, req.body, function(err, category) {
        if (err) return next(err);
        res.json(category);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.delete('/category/:id', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
      AwardsCategory.findByIdAndRemove(req.params.id, function(err, category) {
        if (err) return next(err);
        res.json(category);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.get('/admin/:userName/:password', function(req, res, next) {
    if (validateToken(req.headers)) {
		if (req.params.userName === "admin" && req.params.password === routeConfig.adminPassword) {
			res.sendStatus(200);
		} else {
			res.sendStatus(401);
		}
    }
    else {
      res.sendStatus(401);
    }
  });

  router.get('/user', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
      AwardsUser.find({}, '-password', function(err, users) {
        if (err) return next(err);
        res.json(users);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.get('/user/name/:userName/:password', function(req, res, next) {
    if (validateToken(req.headers)) {
      AwardsUser.findOne({ name_lower: req.params.userName.toLowerCase() }, function(err, user) {
        if (err) return next(err);

        if (user && user.password === encrypt(req.params.password)) {
          user.password = "";
          res.json(user);
        }
        else {
          res.sendStatus(401);
        }
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.get('/user/email/:email/:password', function(req, res, next) {
    if (validateToken(req.headers)) {
      getUserEmail(req, next, true)
        .then(function(user) {
          if (user && user.password === encrypt(req.params.password)) {
            user.password = "";
            res.json(user);
          }
          else {
            res.sendStatus(401);
          }
        });
    }
    else {
      res.sendStatus(401);
    }
  });
  
  router.get('/user/name/:userName', function(req, res, next) {
    if (validateToken(req.headers)) {
	  AwardsUser.findOne({ name_lower: req.params.userName.toLowerCase() }, 'name').exec(function(err, user) {
        if (err) return next(err);
        res.json(user);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.get('/user/email/:email', function(req, res, next) {
    if (validateToken(req.headers)) {
      getUserEmail(req, next)
        .then(function(user) {
          res.json(user);
        });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.post('/user', function(req, res, next) {
    if (validateToken(req.headers)) {
      var newUser = req.body;
      newUser.name_lower = newUser.name.toLowerCase();
	  newUser.email = newUser.email.toLowerCase();
	  
	  newUser.password = encrypt(newUser.password);

      AwardsUser.create(newUser, function(err, user) {
        if (err) return next(err);

        user.password = "";
        res.json(user);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.post('/user/email/:email', function(req, res, next) {
    if (validateToken(req.headers)) {
      getUserEmail(req, next)
        .then(function(user) {
          if (user) {
            var hash = generatePassword(32, false);

            user.hash = hash;

            updateUser(user._id, user, next)
              .then(function(user) {
                var mailOptions = {
                  from: routeConfig.email.user,
                  to: user.email,
                  subject: 'Password reset request',
                  html: '<p>Hello, ' + user.name +
                    ', we received a request to reset your password. If this is correct, please click the following link to complete the password reset process:</p><p><a href="' +
                    routeConfig.userUrl + "#r=" + hash +
                    '">' + routeConfig.userUrl + "#r=" + hash +
                    '</a></p><p>If you ignore this message, your password will not be reset.</p>'
                };

                emailHelper.send(routeConfig.email, mailOptions);

                user.password = user.hash = "";
                res.json(user);
              });
          }
          else {
            res.sendStatus(404);
          }
        });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.post('/user/hash/:hash', function(req, res, next) {
    AwardsUser.findOne({ hash: req.params.hash }, function(err, user) {
      if (err) return next(err);
      if (user) {
        var password = generatePassword();

        user.password = encrypt(password);
        user.hash = "";

        updateUser(user._id, user, next)
          .then(function(user) {
            var mailOptions = {
              from: routeConfig.email.user,
              to: user.email,
              subject: 'Password reset',
              html: '<p>Hello, ' + user.name +
                ', your new password is: ' + password + '</p><p>Click <a href="' +
                routeConfig.userUrl +
                '">here</a> to login.</p>'
            };

            emailHelper.send(routeConfig.email, mailOptions);

            user.password = "";
            res.json(user);
          });
      }
      else {
        res.sendStatus(401);
      }
    });
  });

  router.put('/user/:id', function(req, res, next) {
    if (validateToken(req.headers)) {
		var user = req.body;
		
		var password = user.password;
		if (password) {
			user.password = encrypt(password);
		}
		
		var name = user.name;
		if (name) {
			user.name_lower = name.toLowerCase();
		}

		updateUser(req.params.id, user, next)
        .then(function(user) {
          user.password = "";
          res.json(user);
        });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.delete('/user/:id', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
      AwardsUser.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return next(err);

		AwardsGame.remove({ name: user.name_lower }, function (err) {});

        res.json(user);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.post('/help/:email', function(req, res, next) {
    if (validateToken(req.headers)) {
      var mailOptions = {
        from: req.params.email,
        to: routeConfig.email.user,
        subject: routeConfig.name + ' Help',
        html: "<p>" + req.params.email + "</p><p>" + req.body.helpText + "</p>"
      };

      emailHelper.send(routeConfig.email, mailOptions);

      res.json(req.body);
    }
    else {
      res.sendStatus(401);
    }
  });
  
  router.get('/game', function(req, res, next) {
    if (validateToken(req.headers)) {
      AwardsGame.find({ game: routeConfig.name }, 'name score', function(err, game) {
        if (err) return next(err);
        res.json(game);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.get('/game/:userName', function(req, res, next) {
    if (validateToken(req.headers)) {
      AwardsGame.findOne({ game: routeConfig.name, name: req.params.userName.toLowerCase() }, function(err, game) {
        if (err) return next(err);
        res.json(game);
      });
    }
    else {
      res.sendStatus(401);
    }
  });
  
  router.put('/game/:id', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
      updateGame(req.params.id, req.body, next)
        .then(function(game) {
          res.json(game);
        });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.post('/game/:userName/pick/:category/:pick', function(req, res, next) {
    if (validateToken(req.headers)) {
      getConfig(next)
        .then(function(config) {
          if (config.gameMode === "before") {
			var userName = req.params.userName.toLowerCase();
			
			AwardsGame.findOne({ game: routeConfig.name, name: userName }, function(err, game) {
			  if (err) return next(err);

			  if (game) {
				  game.picks[req.params.category] = req.params.pick;
				  
				  updateGame(game._id, game, next)
					.then(function(game) {
					  res.json(game);
					});
			  } else {
				  var newGame = {
					  name: userName,
					  game: routeConfig.name,
					  picks: {}
				  };
				  newGame.picks[req.params.category] = req.params.pick;
				  
				  AwardsGame.create(newGame, function(err, game) {
					if (err) return next(err);
					res.json(game);
				  });
			  }
		    });
          }
          else {
            res.sendStatus(403);
          }
        });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.get('/feedback', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
      Feedback.find({ app: routeConfig.name }).sort('date').exec(function(err, feedback) {
        if (err) return next(err);
        res.json(feedback);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.post('/feedback', function(req, res, next) {
    if (validateToken(req.headers)) {
		var newFeedback = req.body;
		newFeedback.app = routeConfig.name;
      Feedback.create(newFeedback, function(err, feedback) {
        if (err) return next(err);
        res.json(feedback);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.delete('/feedback/:id', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
      Feedback.findByIdAndRemove(req.params.id, function(err, id) {
        if (err) return next(err);
        res.json(id);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.post('/config', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
		var config = req.body;
		config.game = routeConfig.name;
      AwardsConfig.create(config, function(err, id) {
        if (err) return next(err);
        res.json(id);
      });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.get('/config', function(req, res, next) {
    if (validateToken(req.headers)) {
      getConfig(next)
        .then(function(config) {
          res.json(config);
        });
    }
    else {
      res.sendStatus(401);
    }
  });

  router.put('/config/:id', function(req, res, next) {
    if (validateAdminToken(req.headers)) {
      updateConfig(req.body, next)
        .then(function(config) {
          res.json(config);
        });
    }
    else {
      res.sendStatus(401);
    }
  });

  return router;
};
