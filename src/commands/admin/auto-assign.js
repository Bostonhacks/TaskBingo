const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

const fs = require('fs').promises;
const path = require('path');

async function loadData(dataFilePath) {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return {}; // file doesn't exist or is invalid
  }
}

// Save data to JSON file
async function saveData(dataFilePath, data) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

module.exports = {
  data: {
    name: 'auto-assign',
    description: 'Set the auto assignment config.',
    options: [
      {
        name: 'value',
        description: 'Set either True or False for the server.',
        type: ApplicationCommandOptionType.Boolean,
        required: true,
      }
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator]
  },

  run: async ({interaction, client, handler}) => {
    if (!interaction.inGuild()) {
          await interaction.reply('You can only run this command inside a server.');
          return;
        }

        const configPath = path.join(__dirname, '../../../config.json');
        const guildId = interaction.guild.id;

        const config = await loadData(configPath);
        config[guildId] = interaction.options.get('value').value;
        await interaction.reply(`Auto assign set to ${interaction.options.get('value').value}`);
        saveData(configPath, config);
      }
}