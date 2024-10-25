const { getDatabaseConnection } = require('../../dbConnectionManager');

module.exports = (client) => {
    client.guilds.cache.map(async (guild) => {
        await getDatabaseConnection(guild.id)
    })
};