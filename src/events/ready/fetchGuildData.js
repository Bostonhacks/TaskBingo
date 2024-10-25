module.exports = async (client) => {

  const newestGuild = client.guilds.cache.last();
  
  await newestGuild.members.fetch(); // Fetches all members on startup
  console.log(`Fetched guild members on server ${newestGuild}`)
};
