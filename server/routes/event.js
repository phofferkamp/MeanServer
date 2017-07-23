var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Event = require('../models/Event.js');

server.listen(4000);

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
