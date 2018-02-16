var mongoose = require('mongoose');

var GameSchema = new mongoose.Schema({
  name: String,
  game: String,
  picks: {},
  score: Number
});

module.exports = mongoose.model('AwardsGame', GameSchema);
