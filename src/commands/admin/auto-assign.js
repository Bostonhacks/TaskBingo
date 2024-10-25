const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

const fs = require('fs');
const path = require('path');

function loadData(dataFilePath) {
  if (fs.existsSync(dataFilePath)) {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data); // Return parsed JSON object
  }
  return {}; // Return empty object if file doesn't exist
}

// Save data to JSON file
function saveData(dataFilePath, data) {
fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2)); // Write data to file
}

module.exports = {
  data: {
    name: 'auto-assign',
    description: 'Set the auto assignment config.',
    options: [
      {
        name: 'value',
        description: 'The name of the board you want users to get.',
        type: ApplicationCommandOptionType.Boolean,
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

    const configPath = path.join(__dirname, '../../../config.json');

    const guildId = interaction.guild.id

    const config = loadData(configPath);

    config[guildId] = interaction.options.get("value").value;
    saveData(configPath, config)

    interaction.reply(`Auto assign set to ${interaction.options.get('value').value}`);
  }
}