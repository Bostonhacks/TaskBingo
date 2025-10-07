const { EmbedBuilder } = require('discord.js');
const { getDatabaseConnection } = require('../../dbConnectionManager'); 
const getPermissionModel = require('../../models/Permission');
const getUserModel = require('../../models/User');
const getBingoCardModel = require('../../models/Bingo');
const path = require('path');
const fs = require('fs');

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

module.exports = async (oldMember, newMember, client) => {

    const configPath = path.join(__dirname, '../../../config.json');
    const config = loadData(configPath)

    if (!config[newMember.guild.id]) {
        console.log(`auto assign set to false for ${newMember.guild.name}`)
        return
    }

    const connection = await getDatabaseConnection(newMember.guild.id);
    const Permission = getPermissionModel(connection)
    const User = getUserModel(connection)
    const Bingo = getBingoCardModel(connection)

    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    addedRoles.map(async (role) => {

        try {
            let perms = await Permission.findOne({ assignedRoles: role.id });
            if (perms) {
                try {

                    const query = {
                        userId: newMember.user.id
                    };
                    let user = await User.findOne(query);

                    if (!user) {
                        try {
                            let bingo = await Bingo.findOne({name: perms.boardName})
                            if (bingo) {

                                try {
                                    newMember.send(`Welcome to ${newMember.guild.name} ${newMember.user}! Here's your bingo board:\n3 Bingos = Shirt\n6 Bingos = Hat\n12 Bingos = Auto Admission (First 20 hackers)`);
                                    const tableEmbed = createTableEmbed(createBooleanArray(perms.gridSize), 0, bingo.image);
                                    const bingoMessage = await newMember.send({embeds: [tableEmbed]})

                                    user = new User({
                                        userId: newMember.user.id,
                                        card: createBooleanArray(perms.gridSize),
                                        cardName: perms.boardName,
                                        messageId: bingoMessage.id
                                    });

                                await user.save();
                                } catch (error) {
                                    if (error.code === 50007) {
                                      console.error("Cannot send messages to this user. They might have DMs disabled or have blocked the bot.");
                                      // Optionally, send a message to a server channel to notify about the issue
                                      return 
                                    } else {
                                        console.error("An unexpected error occurred:", error);
                                    }
                                }
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } 
                    else {
                        try {
                            let bingo = await Bingo.findOne({name: perms.boardName})
                            if (bingo) {

                                try {
                                    newMember.send(`Welcome to ${newMember.guild.name} ${newMember.user}! Here's your bingo board:\n3 Bingos = Shirt\n6 Bingos = Hat\n12 Bingos = Auto Admission (First 20 hackers)`);
                                } catch (error) {
                                    if (error.code === 50007) {
                                      console.error("Cannot send messages to this user. They might have DMs disabled or have blocked the bot.");
                                      // Optionally, send a message to a server channel to notify about the issue
                                      return 
                                    } else {
                                        console.error("An unexpected error occurred:", error);
                                        return
                                    }
                                }
                                const tableEmbed = createTableEmbed(createBooleanArray(perms.gridSize), 0, bingo.image);
                                const bingoMessage = await newMember.send({embeds: [tableEmbed]})

                                user.card = createBooleanArray(perms.gridSize)
                                user.cardName = perms.boardName
                                user.messageId = bingoMessage.id

                                await user.save();
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    }
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                } catch (error) {
                    console.error(`Could not send DM to ${newMember.user}:`, error);
                }
            } else {
                console.log("No boards assigned")
            }
        } catch (error) {
            console.log(`Error with assignBingoBoard: ${error}`);
            return
        }

    })
};