const { PermissionFlagsBits } = require('discord.js');
const {getDatabaseConnection} = require('../../dbConnectionManager');
const getBingoCardModel = require('../../models/Bingo');

module.exports = {
    run: async ({interaction, client, handler}) => {
      if (!interaction.inGuild()) {
        interaction.reply('You can only run this command inside a server.');
        return;
      }
  
      try {
        await interaction.deferReply();

        const connection = await getDatabaseConnection(interaction.guild.id);
        const Bingo = await getBingoCardModel(connection)
  
        let allBingos = await Bingo.find();
        if (allBingos && allBingos.length > 0) {
            const boardList = allBingos.map(board => `- ${board.name} (${board.gridSize} x ${board.gridSize})`).join('\n');
            interaction.editReply((`Here are all the bingo boards:\n${boardList}`));
            return
        } else {
            interaction.editReply(`No bingo boards.`);
        }
  
      } catch (error) {
        console.log(error)
        return
      }
    },

    data: {
      name: 'board-list',
      description: 'Get a list of all bingo boards and their sizes',
      permissionsRequired: [PermissionFlagsBits.Administrator]
    }
  };
