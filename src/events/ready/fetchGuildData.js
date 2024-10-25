module.exports = async (client) => {
  client.guilds.cache.map(async (guild) => {
    await guild.members.fetch(); // Fetches all members on startup
    console.log(`Fetched guild members on server ${guild}`)
  })
};
