const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');
const {getDatabaseConnection} = require('../../dbConnectionManager');
const getUserModel = require('../../models/User');

function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

module.exports = {
  data: {
    name: 'uncollect',
    description: 'Removes an item from the user\'s collected list',
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
                  interaction.reply(`${interaction.options.get("user").user} hasn't collected ${item}`);
                  return
                }
                else {
                  let index = user.collectedItems.indexOf(item);
                  user.collectedItems = user.collectedItems.splice(index, 1);
                }
            } else {
              interaction.reply(`${interaction.options.get("user").user} hasn't collected any items`);
            }
            await user.save()
        }

      } catch (error) {
        console.log(error)
      }
    
  }
}