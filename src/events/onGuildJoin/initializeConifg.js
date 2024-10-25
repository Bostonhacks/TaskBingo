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

module.exports = async (guild, client) => {
    const configPath = path.join(__dirname, '../../../config.json');

    const guildId = guild.id
    
    const config = loadData(configPath);

    if (!(guildId in config)) {
        config[guildId] = false;
        saveData(configPath, config)
        console.log(`Initialized preferences for ${guild}.`)
    }
    else {
        console.log(`Preferences already exist for ${guild}`)
    }
    
    
};
  