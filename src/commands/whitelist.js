import {
  SlashCommandBuilder,
  escapeMarkdown,
  inlineCode,
  bold,
} from 'discord.js';
import buildDefaultEmbed from '../util/discord_helpers/defaultEmbed.js';
import generateServerChoices from '../util/discord_helpers/serverChoices.js';
import runRconCommand from '../util/mcserver/rconCommand.js';
import mcconfig from '../config/mcConfig.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Get information about the whitelist & add/remove users.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription(
          'Adds a Player to the Whitelist on all Minecraft Servers.',
        )
        .addStringOption((option) =>
          option
            .setName('ign')
            .setDescription('The Players In-Game Name.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription(
          'Removes a Player from the Whitelist on all Minecraft Servers.',
        )
        .addStringOption((option) =>
          option
            .setName('ign')
            .setDescription('The Players In-Game Name.')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Returns the Whitelist.')
        .addStringOption((option) =>
          option
            .setName('server')
            .setDescription('The Server you want the Whitelist from.')
            .setRequired(true)
            .addChoices(...generateServerChoices()),
        ),
    ),
  async execute(interaction) {
    await interaction.deferReply();

    if (interaction.options.getSubcommand() === 'add') {
      const ign = interaction.options.getString('ign');
      const props = Object.getOwnPropertyNames(mcconfig);

      try {
        const whitelistCheck = [];
        const opCheck = [];

        for (const s of props) {
          const { host, rconPort, rconPassword } = mcconfig[s];

          whitelistCheck.push(
            await runRconCommand(
              host,
              rconPort,
              rconPassword,
              `whitelist add ${ign}`,
            ),
          );

          if (mcconfig[s].operator === true) {
            opCheck.push(
              await runRconCommand(host, rconPort, rconPassword, `op ${ign}`),
            );
          }
        }

        await interaction.editReply(
          `Successfully added ${inlineCode(ign)} to the whitelist on ${bold(
            whitelistCheck.length,
          )} servers.\nSuccessfully made ${inlineCode(
            ign,
          )} an operator on ${bold(opCheck.length)} servers.`,
        );
      } catch (err) {
        console.error(err);
        await interaction.editReply(
          'Something went wrong trying to execute this command! Please check if all servers are currently online.',
        );
      }
    } else if (interaction.options.getSubcommand() === 'remove') {
      const ign = interaction.options.getString('ign');
      const props = Object.getOwnPropertyNames(mcconfig);

      try {
        const whitelistCheck = [];
        const opCheck = [];

        for (const s of props) {
          const { host, rconPort, rconPassword } = mcconfig[s];

          whitelistCheck.push(
            await runRconCommand(
              host,
              rconPort,
              rconPassword,
              `whitelist remove ${ign}`,
            ),
          );

          if (mcconfig[s].operator === true) {
            opCheck.push(
              await runRconCommand(host, rconPort, rconPassword, `deop ${ign}`),
            );
          }
        }

        await interaction.editReply(
          `Successfully removed ${inlineCode(ign)} from the whitelist on ${bold(
            whitelistCheck.length,
          )} servers.\nSuccessfully removed ${inlineCode(
            ign,
          )} as an operator on ${bold(opCheck.length)} servers.`,
        );
      } catch (err) {
        console.error(err);
        await interaction.editReply(
          'Something went wrong trying to execute this command! Please check if all servers are currently online.',
        );
      }
    } else if (interaction.options.getSubcommand() === 'list') {
      const choice = interaction.options.getString('server');

      const { host, rconPort, rconPassword } = mcconfig[choice];

      try {
        const response = await runRconCommand(
          host,
          rconPort,
          rconPassword,
          'whitelist list',
        );

        if (response === 'There are no whitelisted players') {
          await interaction.editReply('There are no whitelisted players!');
          return;
        }

        const whitelistNames = response.split(': ');
        const whitelist = whitelistNames[1]
          .split(', ')
          .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
          .map(escapeMarkdown)
          .join('\n');

        const whitelistEmbed = buildDefaultEmbed(interaction.user)
          .setTitle(`${choice.toUpperCase()} Whitelist`)
          .setThumbnail(interaction.guild.iconURL())
          .setDescription(whitelist);

        interaction.editReply({ embeds: [whitelistEmbed] });
      } catch (err) {
        console.error(err);
        await interaction.editReply('Server offline or unreachable!');
      }
    }
  },
};
