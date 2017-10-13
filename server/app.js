var config = require('./config');

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

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

var app = express();

app.use(cors(corsOptions));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended': 'false' }));
app.use(express.static(path.join(__dirname, '../views')));

for (var i = 0; i < config.routes.length; i++) {
  var route = config.routes[i];

  var router = require('./routes/' + route.name)(config.whitelist, route.socketioPort, route.token);

  app.use('/' + route.name, router);
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/' + config.appName, {
  useMongoClient: true
})
  .then(() => console.log('connection successful'))
  .catch((err) => console.error(err));

module.exports = app;
