var mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
	game: String,
  title: String,
  nominees: [String],
  winner: Number,
  index: Number
});

module.exports = mongoose.model('AwardsCategory', CategorySchema);
