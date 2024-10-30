const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const {getDatabaseConnection} = require('../../dbConnectionManager');
const getUserModel = require('../../models/User');


module.exports = {
  data: {
    name: 'collect-list',
    description: 'Shows the list of collected items for a given user.',
    options: [
      {
        name: 'user',
        description: 'The name of the user',
        type: ApplicationCommandOptionType.User,
        required: true,
      }
    ]
  },

  run: async ({interaction, client, handler}) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }
  
      try {

        const connection = await getDatabaseConnection(interaction.guild.id);
        const User = await getUserModel(connection)

        const query = {
            userId: interaction.options.get('user').user.id
          };
    
        let user = await User.findOne(query);

        if (user) {
            const msg = user.collectedItems?.map(item => `- ${item}`).join('\n') || '';

            if (msg.length > 0) {
                interaction.reply(msg);
            } else {
                interaction.reply(`${interaction.options.get("user").user} has not collected any items `);
            }
        }

      } catch (error) {
        console.log(error)
      }
    
  }
}