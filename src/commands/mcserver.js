import { SlashCommandBuilder, bold } from 'discord.js';
import pteroClient from '../util/pterodactyl/pteroClient.js';
import generateServerChoices from '../util/discord_helpers/serverChoices.js';
import buildDefaultEmbed from '../util/discord_helpers/defaultEmbed.js';
import buildConfirmButton from '../util/discord_helpers/confirmButton.js';
import formatBytes from '../util/discord_helpers/formatBytes.js';
import formatTime from '../util/discord_helpers/formatTime.js';
import capitalizeFirstLetter from '../util/discord_helpers/capitalizeFirstLetter.js';
import startServer from '../util/pterodactyl/startServer.js';
import pteroconfig from '../config/pteroConfig.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('mcserver')
    .setDescription('Control a Minecraft Server.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('start')
        .setDescription('Starts a Minecraft Server.')
        .addStringOption((option) =>
          option
            .setName('server')
            .setDescription('The Server you want to start.')
            .setRequired(true)
            .addChoices(...generateServerChoices())
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stop')
        .setDescription('Stops a Minecraft Server.')
        .addStringOption((option) =>
          option
            .setName('server')
            .setDescription('The Server you want to stop.')
            .setRequired(true)
            .addChoices(...generateServerChoices())
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('restart')
        .setDescription('Restarts a Minecraft Server.')
        .addStringOption((option) =>
          option
            .setName('server')
            .setDescription('The Server you want to restart.')
            .setRequired(true)
            .addChoices(...generateServerChoices())
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('kill')
        .setDescription('Kills a Minecraft Server.')
        .addStringOption((option) =>
          option
            .setName('server')
            .setDescription('The Server you want to kill.')
            .setRequired(true)
            .addChoices(...generateServerChoices())
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('stats')
        .setDescription('Returns the Usage Statistics of a Server.')
        .addStringOption((option) =>
          option
            .setName('server')
            .setDescription('The server you want to get Usage Statistics from.')
            .setRequired(true)
            .addChoices(...generateServerChoices())
        )
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const choice = interaction.options.getString('server');
    const serverChoice = capitalizeFirstLetter(choice);
    const guildName = interaction.guild.name;
    const serverid = pteroconfig.severId[choice];
    const subcommand = interaction.options.getSubcommand();

    try {
      const stats = await pteroClient.getServerUsages(serverid);

      if (subcommand === 'stats') {
        if (stats.current_state !== 'running') {
          interaction.editReply(
            `${guildName} ${bold(serverChoice)} is currently ${
              stats.current_state
            }!`
          );
          return;
        }

        const state = `${capitalizeFirstLetter(stats.current_state)}`;
        const cpu = `${parseFloat(stats.resources.cpu_absolute).toFixed(2)}%`;
        const memory = formatBytes(stats.resources.memory_bytes);
        const disk = formatBytes(stats.resources.disk_bytes);
        const uptime = formatTime(stats.resources.uptime);

        const statsEmbed = buildDefaultEmbed(interaction.user)
          .setTitle(`Server Stats KiwiTech ${serverChoice}`)
          .setThumbnail(interaction.guild.iconURL())
          .setColor('Green')
          .addFields([
            { name: 'State', value: state },
            { name: 'Uptime', value: uptime },
            { name: 'CPU', value: cpu, inline: true },
            { name: 'Memory', value: memory.toString(), inline: true },
            { name: 'Disk', value: disk.toString(), inline: true },
          ]);

        interaction.editReply({ embeds: [statsEmbed] });
      } else if (subcommand === 'start') {
        if (stats.current_state !== 'offline') {
          interaction.editReply(
            `Cannot start ${guildName} ${bold(
              serverChoice
            )} because it is currently ${stats.current_state}!`
          );
        } else {
          const start = await startServer(serverid, serverChoice);
          interaction.editReply(start);
        }
      } else {
        if (subcommand === 'stop' && stats.current_state !== 'running') {
          interaction.editReply(
            `Cannot stop ${guildName} ${bold(
              serverChoice
            )} because it is currently ${stats.current_state}!`
          );
          return;
        }

        if (subcommand === 'restart' && stats.current_state !== 'running') {
          interaction.editReply(
            `Cannot restart ${guildName} ${bold(
              serverChoice
            )} because it is currently ${stats.current_state}!`
          );
          return;
        }

        if (subcommand === 'kill' && stats.current_state !== 'stopping') {
          interaction.editReply(
            `Cannot kill ${guildName} ${bold(
              serverChoice
            )} because it is currently ${
              stats.current_state
            }! Servers can only be killed while they are stopping. `
          );
          return;
        }

        interaction.editReply(
          buildConfirmButton(serverChoice, interaction.guild, subcommand)
        );

        const filter = (click) => click.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
          max: 1,
          time: 10000,
          filter,
        });

        collector.on('collect', async (i) => {
          if (i.customId === 'confirm') {
            const performAction = () => {
              if (subcommand === 'stop')
                return pteroClient.stopServer(serverid);
              if (subcommand === 'kill')
                return pteroClient.killServer(serverid);
              if (subcommand === 'restart')
                return pteroClient.restartServer(serverid);
              return false;
            };

            const result = await performAction();

            if (result === true) {
              const getAction = () => {
                if (subcommand === 'stop') return 'stopped';
                if (subcommand === 'kill') return 'killed';
                if (subcommand === 'restart') return 'restarted';
                return undefined;
              };

              i.update({
                content: `Successfully ${getAction()} ${guildName} ${bold(
                  serverChoice
                )}!`,
                components: [],
              });
            }
          } else {
            await i.update({
              content: `Cancelled Action ${
                subcommand.toUpperCase
              } for ${guildName} ${bold(serverChoice)}!`,
              components: [],
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: `Something went wrong trying to execute the command for the server ${bold(
          serverChoice
        )}!`,
        ephemeral: true,
      });
    }
  },
};
