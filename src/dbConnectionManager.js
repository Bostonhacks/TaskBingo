const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables if needed

const connections = {}; // Cache for connections

/**
 * Function to get or create a Mongoose connection for a specific server's database.
 */
async function getDatabaseConnection(serverId) {
  if (serverId in connections) {
    return connections[serverId];  // Return existing connection
  }

  mongoose.set('strictQuery', false);
  try {
    const uri = `${process.env.MONGODB_PARTIAL_URI}${serverId}?retryWrites=true&w=majority&appName=Discord`
    const connection = await mongoose.createConnection(uri);
    console.log(`Connected to cooresponding DB for ${serverId}.`);
    connections[serverId] = connection;  // Cache the connection

    return connection;
  } catch (error) {
    console.log(`Error: ${error}`);
  }
}

module.exports = { getDatabaseConnection };
