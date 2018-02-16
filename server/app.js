var config = require('./config');

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var cors = require('cors');

var corsOptions = {
  origin: function (origin, callback) {
 	// console.log("app origin:", origin);
    if (!origin || config.whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

var app = express();

app.use(cors(corsOptions));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ 'extended': 'false' }));
app.use(express.static(path.join(__dirname, '../views')));

app.get('/', function(req,res){
  res.redirect('/oscars');
}); 

for (var i = 0; i < config.routes.length; i++) {
  var route = config.routes[i];

  var router = require('./routes/' + route.name)(route, config.whitelist);

  app.use('/' + route.name, router);
}

// recaptcha
var recaptcha = require('./routes/recaptcha')(config.recaptchaSecret);
app.use('/recaptcha', recaptcha);

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
