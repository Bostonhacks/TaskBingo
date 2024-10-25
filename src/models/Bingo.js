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

const getBingoCardModel = (connection) => {
  return connection.model('bingoCard', bingoCard);
};

module.exports = getBingoCardModel

// module.exports = model('bingoCard', bingoCard);