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
  },
  collectedItems: {
    type: [String],
    required: false
  }
});

// module.exports = model('User', user);

const getUserModel = (connection) => {
  return connection.model('User', user);
};

module.exports = getUserModel