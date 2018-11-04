var mongoose = require('mongoose');

var candleSchema = new mongoose.Schema({
  yes:Boolean,
  date: {
    type: Date, default: Date.now
  },
  close: {
    type: Number, default: 0.0
  },
  open: {
    type: Number, default: 0.0
  },
  high: {
    type: Number, default: 0.0
  },
  low: {
    type: Number, default: 0.0
  },
  mm50: {
    type: Number, default: 0.0
  },
  mm200: {
    type: Number, default: 0.0
  },
  trueRange: {
    type: Number, default: 0.0
  },
  atr: {
    type: Number, default: 0.0
  },
  spread: {
    type: Number, default: 0.0
  },
  volume: {
    type: Number, default: 0
  },
  instrument: String,
  instrumentNick: String,
  ut: {
    type: Number, default: 0
  },
  zigzag: Boolean
}, { strict: false });

var CandleModel = mongoose.model('Candle', candleSchema);
module.exports = CandleModel;
