module.exports = async (guild, client) => {
  
  await guild.members.fetch(); // Fetches all members on startup
  console.log(`Fetched guild members on server ${guild}`)
};
