const { ApplicationCommandOptionType, AttachmentBuilder, PermissionFlagsBits} = require('discord.js');
const { getDatabaseConnection } = require('../../dbConnectionManager')
const getBingoCardModel = require('../../models/Bingo');

module.exports = {
    data: {
      name: 'create',
      description: "Create a bingo board",
      options: [
        {
          name: 'name',
          description: 'the name of the bingo board',
          type: ApplicationCommandOptionType.String,
        },
        {
          name: 'image',
          description: 'the url of the bingo board',
          type: ApplicationCommandOptionType.String,
        },
        {
          name: 'grid-size',
          description: 'The size of the grid n (n x n), where n is odd',
          type: ApplicationCommandOptionType.Number,
        },
      ], 
      permissionsRequired: [PermissionFlagsBits.Administrator],
    },

    run: async ({interaction, client, handler}) => {
        if (!interaction.inGuild()) {
          interaction.reply({
            content: 'You can only run this command inside a server.',
            ephemeral: true,
          });
          return;
        }
        if (interaction.options.get("grid-size").value % 2 == 0) {
          interaction.reply({
            content: 'The grid size has to be odd',
            ephemeral: true,
          });
          return;
        }
            try {
                await interaction.deferReply();

                const connection = await getDatabaseConnection(interaction.guild.id);
                const Bingo = getBingoCardModel(connection)

                const query = {
                    name: interaction.options.get('name').value
                };

                let bingo = await Bingo.findOne(query);

                if (bingo) {
                    interaction.editReply(
                        `${interaction.options.get("name").value} already exists`
                    );
                    return

                } else {
                    bingo = new Bingo({
                    name: interaction.options.get('name').value,
                    image: interaction.options.get("image").value,
                    gridSize: interaction.options.get("grid-size").value
                    });
                } 

                await bingo.save();
                console.log()
                const bingoBoard = new AttachmentBuilder(interaction.options.get("image").value)
                interaction.editReply({ 
                    content: `${interaction.options.get("name").value} of grid size ${interaction.options.get("grid-size").value}x${interaction.options.get("grid-size").value} was created.`, 
                    files: [bingoBoard] 
                }
                );
                } catch (error) {
                  console.log(`Error with /create: ${error}`);
                }

      },
    
  };