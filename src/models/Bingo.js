const { Schema, model } = require('mongoose');

const bingoCard = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  gridSize: {
    type: Number,
    required: true
  }
});

module.exports = model('bingoCard', bingoCard);