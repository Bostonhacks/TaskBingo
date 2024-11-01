const { ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const {getDatabaseConnection} = require('../../dbConnectionManager');
const getBingoCardModel = require('../../models/Bingo');
const getPermissionModel = require('../../models/Permission');
const getUserModel = require('../../models/User');

const fs = require('fs')
const path = require('path')

function loadData(dataFilePath) {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data); // Return parsed JSON object
  }
  return {}; // Return empty object if file doesn't exist
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

function createBooleanArray(n) {
  const mid = Math.floor(n / 2); // Find the middle index

  return Array.from({ length: n }, (row, i) =>
      Array.from({ length: n }, (col, j) => (i === mid && j === mid ? true : false))
  );
}


module.exports = {
  data: {
    name: 'assign-board',
    description: 'Assign a bingo board for Hackers to recieve',
    options: [
      {
        name: 'board-name',
        description: 'The name of the board you want users to get.',
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: 'role',
        description: 'The role you want to assign the board to',
        type: ApplicationCommandOptionType.Role,
        required: true,
      },
      {
        name: 'resend',
        description: 'Resend the bingo card message',
        type: ApplicationCommandOptionType.Boolean,
        required: true
      }
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator]
  },

  run: async ({interaction, client, handler}) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    const targetRoleId = interaction.options.get('role').value;

    const configPath = path.join(__dirname, '../../../config.json');
    const config = loadData(configPath)

    const connection = await getDatabaseConnection(interaction.guild.id);
    const User = await getUserModel(connection)
    const Bingo = await getBingoCardModel(connection)
    const Permission = await getPermissionModel(connection)

    try {
      await interaction.deferReply();
      
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
          if (permissions.assignedRoles.includes(targetRoleId) && !interaction.options.get('resend').value) {
            interaction.editReply(`${bingo.name} already assigned to <@&${interaction.options.get('role').value}>.`);
            return;
          } else {
            if (!interaction.options.get('resend').value) {
              permissions.assignedRoles.push(targetRoleId)
            }
          }
        } else {
            permissions = new Permission({
              boardName: bingo.name,
              gridSize: bingo.gridSize,
              assignedRoles: [targetRoleId]
          })
        }
        await permissions.save();
        interaction.editReply(`${bingo.name} assigned to <@&${interaction.options.get('role').value}>.`);
      }

    } catch (error) {
      console.log(error)
      return
    }

    if (config[interaction.guild.id]) {
      console.log("auto assign set to true")
    } else {
      const membersWithRole = interaction.guild.members.cache.filter(member => member.roles.cache.has(targetRoleId));
      const memberIds = membersWithRole.map(member => member.id);
      const memberHashtable = membersWithRole.reduce((acc, member) => {
        acc[member.id] = member; // Use member.id as the key and the member object as the value
        return acc;
      }, {});

      try {
        let bingo = await Bingo.findOne({name: interaction.options.get("board-name").value})
        if (bingo) {

          User.find({ userId: { $in: memberIds } })
          .then(async existingUsers => {
            const existingUserIds = existingUsers.map(user => user.userId);
            const tableEmbed = createTableEmbed(createBooleanArray(bingo.gridSize), 0, bingo.image);
            const usersToInsert = await Promise.all(memberIds
              .filter(id => !existingUserIds.includes(id))  // Find non-existing users
              .map(async id => {
                const member = memberHashtable[id]
                member.send(`Welcome to ${interaction.guild.name} ${member.user}! Here's your bingo board:\n3 Bingos = Hat\n6 Bingos = Shirt\n12 Bingos = Auto Admission (First 20 hackers)`);
                const bingoMessage = await member.send({embeds: [tableEmbed]})
                return {
                  userId: id,  
                  cardName: bingo.name,  // Default values for new users
                  messageId: bingoMessage.id,
                  card: createBooleanArray(bingo.gridSize)
                }
              }));
              // Insert new users if needed
              if (usersToInsert.length > 0) {
                User.insertMany(usersToInsert);
                console.log(`Inserted ${usersToInsert.length} users for ${interaction.guild.name}`)
              }

              const messageIdHashtable = existingUsers.reduce((acc, user) => {
                acc[user.userId] = user.messageId; // Use member.id as the key and the member object as the value
                return acc;
              }, {});

              existingUserIds.map(async id => {
                const userObj = memberHashtable[id].user
                const dmChannel = await userObj.createDM();
                const message = await dmChannel.messages.fetch(messageIdHashtable[id]);
                await message.edit({ embeds: [tableEmbed] })
                const notif = await dmChannel.send(`${userObj}`)
                notif.delete()
              })

              if (existingUserIds.length > 0) {
                console.log(`Updated ${existingUserIds.length} users for ${interaction.guild.name}`)
                return User.updateMany(
                  { userId: { $in: existingUserIds } },
                  { $set: { 
                    card: createBooleanArray(bingo.gridSize),
                    cardName: bingo.name 
                  } }
                );
              }
            })

        }
      } catch (error) {
        console.log(error)
      }
      
    }      
    } 
}