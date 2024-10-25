const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
const mongoose = require('mongoose');

module.exports = (guild, client) => {

    (async () => {
        try {
          mongoose.set('strictQuery', false);
          const uri = `${process.env.MONGODB_PARTIAL_URI}${guild.id}?retryWrites=true&w=majority&appName=Discord`
          await mongoose.connect(uri);
          console.log(`Connected to cooresponding DB for ${guild}.`);
          
        } catch (error) {
          console.log(`Error: ${error}`);
        }
      })();

};