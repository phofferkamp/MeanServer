var mongoose = require('mongoose');

var EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  start: Date,
  end: Date,
  allDay: Boolean,
  allDayStart: Date,
  allDayEnd: Date,
  colorName: String,
  locationName: String,
  address: String,
  city: String,
  state: String,
  country: String,
  postalCode: String,
  eventUrl: String,
  imageUrl: String
});

module.exports = mongoose.model('Event', EventSchema);
