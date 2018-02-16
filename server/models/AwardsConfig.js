var mongoose = require('mongoose');

var ConfigSchema = new mongoose.Schema({
	game: String,
  gameMode: String,
  gameStart: Date,
  autoStart: String
});

module.exports = mongoose.model('AwardsConfig', ConfigSchema);
