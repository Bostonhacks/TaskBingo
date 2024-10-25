const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

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

      const usersInput = interaction.options.get('users').value;
      const users = usersInput.split(',').map(user => user.trim());
      
      const userIds = [];

        for (const username of users) {
            // Try to find the member by username in the guild
            const member = interaction.guild.members.cache.find(m => m.user.username === username);

            if (member) {
                userIds.push(member.id); // Push the user ID to the array
            } else {
                interaction.reply(`${member} not found`);
                return
            }
        }
  
      try {

        const query = {
          userId: {$in: userIds}
        };
  
        let users = await User.find(query);

        if (interaction.options.get('cell-number').value > users[0].card.length ** 2) {
          interaction.reply('Invalid cell number');
          return
        }

        await interaction.deferReply();

        users.map(async (user) => {
            if (!user) {
                interaction.editReply(`${user} bingo board not set up.`);
            } else {
                const { rowIndex, colIndex }  = calculateRowAndColumn(user.card.length, interaction.options.get('cell-number').value - 1)

                user.card[rowIndex][colIndex] = true
                
                await user.save()

                const userObj = await client.users.fetch(user.userId)
                const dmChannel = await userObj.createDM();

                const message = await dmChannel.messages.fetch(user.messageId);
                const embed = message.embeds[0]
                const image = embed.image.url;
                const bingoCount = calculateBingos(user.card)
                let updatedEmbed = createTableEmbed(user.card, bingoCount, image)
                await message.edit({ embeds: [updatedEmbed] })

                const notif = await dmChannel.send(`${userObj}`)
                notif.delete()

                interaction.followUp(`${userObj} has completed task ${interaction.options.get('cell-number').value} (${bingoCount}/${user.card.length*2+2}).`);

            }

        })

      } catch (error) {
        console.log(error)
        return
      }
    },

    data: {
      name: 'mark-many',
      description: 'Mark a bingo board cell for multiple users',
      options: [
        {
          name: 'users',
          description: 'Usernames of users to mark separated by a comma',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: 'cell-number',
          description: 'The cell number to mark',
          type: ApplicationCommandOptionType.Number,
          required: true,
        }
      ],
      permissionsRequired: [PermissionFlagsBits.Administrator]
    }

  };