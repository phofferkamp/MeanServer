var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  name_lower: String,
  password: String,
  email: String,
  hash: String
});

module.exports = mongoose.model('AwardsUser', UserSchema);
