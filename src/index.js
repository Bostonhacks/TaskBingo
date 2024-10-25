require('dotenv').config();
const { Client, IntentsBitField } = require('discord.js');
const path = require('path');
const { CommandHandler } = require('djs-commander');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: ['GUILD_MEMBER'],
});

new CommandHandler({
      client, // Discord.js client object | Required by default
      commandsPath: path.join(__dirname, 'commands'), // The commands directory
      eventsPath: path.join(__dirname, 'events'), // The events directory
    });

client.login(process.env.TOKEN);