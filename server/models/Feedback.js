var mongoose = require('mongoose');

var schema = new mongoose.Schema({
  name: String,
  email: String,
  date: Date,
  app: String,
  feedback: String
});

module.exports = mongoose.model('Feedback', schema);
