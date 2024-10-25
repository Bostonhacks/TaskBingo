const { getDatabaseConnection } = require('../../dbConnectionManager');

module.exports = (guild, client) => {

    (async () => {
          await getDatabaseConnection(guild.id)
    })();

};