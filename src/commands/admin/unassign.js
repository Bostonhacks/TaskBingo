const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

const {getDatabaseConnection} = require('../../dbConnectionManager');
const getBingoCardModel = require('../../models/Bingo');
const getPermissionModel = require('../../models/Permission');


module.exports = {

  run: async ({interaction, client, handler}) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    const targetRoleId = interaction.options.get('role').value;

    try {
      await interaction.deferReply();

      const connection = await getDatabaseConnection(interaction.guild.id);
      const Bingo = await getBingoCardModel(connection)
      const Permission = await getPermissionModel(connection)
      
      const query = {
        name: interaction.options.get('board-name').value
      };

      let bingo = await Bingo.findOne(query);
      if (!bingo) {
          interaction.editReply(`${interaction.options.get('board-name').value} doesn't exist.`);
          return;
      } else {

        const permQuery = {
          boardName: bingo.name
        };
  
        let permissions = await Permission.findOne(permQuery);
        if (permissions) {
          if (permissions.assignedRoles.includes(targetRoleId)) {
            const index = permissions.assignedRoles.indexOf(targetRoleId);
            permissions.assignedRoles.splice(index, 1);
          } else {
            interaction.editReply(`${bingo.name} not assigned to <@&${interaction.options.get('role').value}>.`);
            return;
          }
        } else {
          interaction.editReply(`Permissions don't exist.`);
          return;
        }
  
        await permissions.save();
        interaction.editReply(`${bingo.name} unassigned from <@&${interaction.options.get('role').value}>.`);
      }

    } catch (error) {
      console.log(error)
      return
    }
  },

  data: {
    name: 'unassign-board',
    description: 'Assign a bingo board for Hackers to recieve',
    options: [
      {
        name: 'board-name',
        description: 'The name of the board you want users to be unassigned.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'role',
        description: 'The role you want to unassign.',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator]
  }
};