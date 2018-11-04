var mongoose = require('mongoose');

var tickSchema = new mongoose.Schema({
  bid: {
    type: Number, default: 0.0
  },
  offer: {
    type: Number, default: 0.0
  },
  utm: {
    type: Number, default: 0
  },
  instrument: String
}, { strict: false });

var TickModel = mongoose.model('Tick', tickSchema);
module.exports = TickModel;
