const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const Permission = require('../../models/Permission');
const User = require('../../models/User');
const Bingo = require('../../models/Bingo');

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
                                const bingoBoard = new AttachmentBuilder(bingo.image)

                                newMember.send(`Welcome to BostonHacks 2024 ${newMember.user}! Here's your bingo board:`);
                                const tableEmbed = createTableEmbed(createBooleanArray(perms.gridSize), 0, bingo.image);
                                const bingoMessage = await newMember.send({embeds: [tableEmbed]})

                                user = new User({
                                    userId: newMember.user.id,
                                    card: createBooleanArray(perms.gridSize),
                                    cardName: perms.boardName,
                                    messageId: bingoMessage.id
                                });

                                await user.save();
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    } 
                    else {
                        try {
                            let bingo = await Bingo.findOne({name: perms.boardName})
                            if (bingo) {
                                const bingoBoard = new AttachmentBuilder(bingo.image)

                                newMember.send(`Welcome to BostonHacks 2024 ${newMember.user}! Here's your bingo board:`);
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