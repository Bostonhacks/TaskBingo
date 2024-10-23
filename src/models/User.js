const { Schema, model } = require('mongoose');

const user = new Schema({
  userId: {
    type: String,
    required: true,
  },
  card: {
    type: [[Boolean]],
    required: true,
  },
  cardName: {
    type: String,
    required: true
  },
  messageId: {
    type: String,
    required: true
  }
});

module.exports = model('User', user);