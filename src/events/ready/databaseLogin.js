const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');

module.exports = (client) => {
    const newestGuild = client.guilds.cache.last();

    (async () => {
        try {
          mongoose.set('strictQuery', false);
          const uri = `${process.env.MONGODB_PARTIAL_URI}${newestGuild.id}?retryWrites=true&w=majority&appName=Discord`
          await mongoose.connect(uri);
          console.log(`Connected to cooresponding DB for ${newestGuild}.`);
          
        } catch (error) {
          console.log(`Error: ${error}`);
        }
      })();

};