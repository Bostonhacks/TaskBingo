const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const {getDatabaseConnection} = require('../../dbConnectionManager');
const getUserModel = require('../../models/User');


function calculateRowAndColumn(n, cellNumber) {
    const rowIndex = Math.floor(cellNumber / n);
    const colIndex = cellNumber % n;
    return { rowIndex, colIndex };
}

function createTableEmbed(data, bingoCount, image) {
  const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setImage(image)
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

        if (interaction.options.get('cell-numbers').value > user.card.length ** 2) {
          interaction.reply('Invalid cell number');
          return
        }

        await interaction.deferReply();

        let cellNumbers = interaction.options.get('cell-numbers').split(',').map(num => Number(num.trim()));
  
        if (!user) {
            interaction.editReply(`${interaction.options.get('user').user} bingo board not set up.`);
            return;
        } else {
          cellNumbers.map((num) => {
            const { rowIndex, colIndex }  = calculateRowAndColumn(user.card.length, num - 1)

            user.card[rowIndex][colIndex] = true

          })
          await user.save();

          const userObj = interaction.options.get('user').user
          const dmChannel = await userObj.createDM();

          const message = await dmChannel.messages.fetch(user.messageId);
          const embed = message.embeds[0]
          const image = embed.image.url;
          const bingoCount = calculateBingos(user.card)
          let updatedEmbed = createTableEmbed(user.card, bingoCount, image)
          await message.edit({ embeds: [updatedEmbed] })

          const notif = await dmChannel.send(`${userObj}`)
          notif.delete()
  
          interaction.editReply(`${interaction.options.get('user').user} has completed task(s) cellNumbers (${bingoCount}/${user.card.length*2+2} bingos).`);

        }
  
      } catch (error) {
        console.log(error)
        return
      }
    },

    data: {
      name: 'mark',
      description: 'Marks a bingo cell',
      options: [
        {
          name: 'user',
          description: 'User to mark',
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: 'cell-numbers',
          description: 'The cell numbers to mark',
          type: ApplicationCommandOptionType.String,
          required: true,
        }
      ],
      permissionsRequired: [PermissionFlagsBits.Administrator]
    }
  };