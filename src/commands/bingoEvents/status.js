const { Client, ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');

function createTableEmbed(data, bingoCount) {
  const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(`${bingoCount}/${data.length*2+2} bingos achieved`);

  // Convert the 2D array to a string
  let tableString = '';
  for (const row of data) {
      const rowString = row.map(value => (value ? '🟢' : '🔴')).join(' '); // Convert true/false to emojis
      tableString += `${rowString}\n`; // Add the row to the table string
  }

  embed.addFields({
    name: " ",
    value: `\`\`\`\n${tableString}\`\`\``,
    inline: false
  }); // Use code block for table formatting
  return embed;
}

function calculateBingos(card) {
  let bingos = 0;
  const n = card.length; // Assuming the card is an n x n array

  // Check rows
  for (let row = 0; row < n; row++) {
      if (card[row].every(value => value === true)) {
          bingos++;
      }
  }

  // Check columns
  for (let col = 0; col < n; col++) {
      let allTrue = true;
      for (let row = 0; row < n; row++) {
          if (card[row][col] !== true) {
              allTrue = false;
              break;
          }
      }
      if (allTrue) {
          bingos++;
      }
  }

  // Check primary diagonal
  let primaryDiagonal = true;
  for (let i = 0; i < n; i++) {
      if (card[i][i] !== true) {
          primaryDiagonal = false;
          break;
      }
  }
  if (primaryDiagonal) {
      bingos++;
  }

  // Check secondary diagonal
  let secondaryDiagonal = true;
  for (let i = 0; i < n; i++) {
      if (card[i][n - 1 - i] !== true) {
          secondaryDiagonal = false;
          break;
      }
  }
  if (secondaryDiagonal) {
      bingos++;
  }

  return bingos;
}

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  run: async ({interaction, client, handler}) => {
    if (!interaction.inGuild()) {
      interaction.reply({
        content: 'You can only run this command inside a server.',
        ephemeral: true,
      });
      return;
    }

    try {

      await interaction.deferReply();

      const connection = await getDatabaseConnection(interaction.guild.id);
      const User = getUserModel(connection)

      const query = {
        userId: interaction.options.get('user').user.id
      };

      let user = await User.findOne(query);

      if (user) {

        const bingoCount = calculateBingos(user.card);

        const tableEmbed = createTableEmbed(user.card, bingoCount);
        interaction.editReply({ 
          content: `${interaction.options.get('user').user}'s bingo board`,
          embeds: [tableEmbed],
        });
      } else {
        interaction.editReply(`${interaction.options.get('user').user}'s bingo board is not set up.`);
      }


    } catch (error) {
      console.log(error)
    }
    
  },

  data: {
    name: 'bingo-status',
    description: "See yours/someone else's bingo board",
    options: [
      {
        name: 'user',
        description: 'The user whose bingo board you want to get.',
        type: ApplicationCommandOptionType.User,
        required: true
      },
    ],
  }
};