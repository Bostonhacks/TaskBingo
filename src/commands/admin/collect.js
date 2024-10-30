const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const {getDatabaseConnection} = require('../../dbConnectionManager');
const getUserModel = require('../../models/User');

function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

module.exports = {
  data: {
    name: 'collect',
    description: 'Add an item to the user\'s collected list',
    options: [
      {
        name: 'user',
        description: 'The name of the user',
        type: ApplicationCommandOptionType.User,
        required: true,
      },
      {
        name: 'item',
        description: 'The item the user collected',
        type: ApplicationCommandOptionType.String,
        required: true,
      }
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator]
  },

  run: async ({interaction, client, handler}) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }
  
      try {

        const item = toTitleCase(interaction.options.get("item").value.trim())

        const connection = await getDatabaseConnection(interaction.guild.id);
        const User = await getUserModel(connection)

        const query = {
            userId: interaction.options.get('user').user.id
          };
    
        let user = await User.findOne(query);

        if (user) {
            if (user.collectedItems) {
                if (!(user.collectedItems.includes(item))) {
                    user.collectedItems.push(item)
                }
                else {
                    interaction.reply(`${item} already added to ${interaction.options.get("user").user}`);
                    return
                }
            } else {
                user.collectedItems = [item]
            }
            await user.save()

            interaction.reply(`${item} added to ${interaction.options.get("user").user}`);
        }

      } catch (error) {
        console.log(error)
      }
    
  }
}