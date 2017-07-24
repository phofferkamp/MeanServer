var config = require('../config');

var express = require('express');
var router = express.Router();
var app = express();

var cors = require('cors');

var corsOptions = {
  origin: function (origin, callback) {
    if (!origin || config.whitelist.indexOf(origin) !== -1) {
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

var server = https.createServer(options, app).listen(config.event.port);

var io = require('socket.io')(server);
var Event = require('../models/Event.js');

// socket io
io.on('connection', function (socket) {
  socket.on('event-updated', function () {
    io.emit('events-update');
  });
});

/* GET all events */
router.get('/', function (req, res, next) {
  Event.find({}, function (err, events) {
    if (err) return next(err);
    res.json(events);
  });
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
  Event.create(req.body, function (err, event) {
    if (err) return next(err);
    res.json(event);
  });
});

/* UPDATE event */
router.put('/:event', function (req, res, next) {
  Event.findByIdAndUpdate(req.params.event, req.body, function (err, event) {
    if (err) return next(err);
    res.json(event);
  });
});

/* DELETE event */
router.delete('/:event', function (req, res, next) {
  Event.findByIdAndRemove(req.params.event, function (err, event) {
    if (err) return next(err);
    res.json(event);
  });
});

module.exports = router;
