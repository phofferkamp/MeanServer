module.exports = function (token, whitelist, socketioPort) {
  var express = require('express');
  var router = express.Router();
  var app = express();

  var cors = require('cors');

  var corsOptions = {
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  }

  app.use(cors(corsOptions));

  var https = require('https');
  var fs = require('fs');

  var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
  };

  var server = https.createServer(options, app).listen(socketioPort);

  var io = require('socket.io')(server);
  var Event = require('../models/Event.js');

  // socket io
  io.on('connection', function (socket) {
    socket.on('event-updated', function () {
      io.emit('events-update');
    });
  });

  function validateToken(headers) {
    return headers.token === token;
  }

  /* GET all events */
  router.get('/', function (req, res, next) {
    if (validateToken(req.headers)) {
      Event.find({}, function (err, events) {
        if (err) return next(err);
        res.json(events);
      });
    } else {
      res.sendStatus(401);
    }
  });

  /* GET event 
  router.get('/:event', function(req, res, next) {
    Event.find({ event: req.params.event }, function (err, event) {
      if (err) return next(err);
      res.json(event);
    });
  });*/

  /* SAVE event */
  router.post('/', function (req, res, next) {
    if (validateToken(req.headers)) {
      Event.create(req.body, function (err, event) {
        if (err) return next(err);
        res.json(event);
      });
    } else {
      res.sendStatus(401);
    }
  });

  /* UPDATE event */
  router.put('/:event', function (req, res, next) {
    if (validateToken(req.headers)) {
      Event.findByIdAndUpdate(req.params.event, req.body, function (err, event) {
        if (err) return next(err);
        res.json(event);
      });
    } else {
      res.sendStatus(401);
    }
  });

  /* DELETE event */
  router.delete('/:event', function (req, res, next) {
    if (validateToken(req.headers)) {
      Event.findByIdAndRemove(req.params.event, function (err, event) {
        if (err) return next(err);
        res.json(event);
      });
    } else {
      res.sendStatus(401);
    }
  });

  //module.exports = router;

  return router;
};
