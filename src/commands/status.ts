import { ApplicationCommandOptionType } from 'discord.js';
import { config } from '../config/config';
import { Command } from '../structures/Command';
import { KoalaEmbedBuilder } from '../structures/embeds/KoalaEmbedBuilder';
import type { TServerChoice } from '../typings/types/typeHelpers';
import getErrorMessage from '../util/functions/errors';
import { getServerChoices } from '../util/functions/helpers';
import { errorLog } from '../util/functions/loggers';
import { getServerStatus, queryMobcap, queryMspt } from '../util/rcon';

export default new Command({
  name: 'status',
  description: 'Get the status of a Minecraft Server.',
  options: [
    {
      name: 'server',
      description: 'Choose a server.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [...getServerChoices()],
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const choice = args.getString('server');

    if (!choice) {
      return interaction.editReply('Please specify a server!');
    }

    if (!interaction.guild) {
      return interaction.reply('This command can only be used in a guild.');
    }

    const { host, port, rconPort, rconPasswd } =
      config.mcConfig[choice as TServerChoice];

    try {
      const status = await getServerStatus(host, port);
      const performance = await queryMspt(host, rconPort, rconPasswd);
      const mobcap = await queryMobcap(host, rconPort, rconPasswd);

      if (!status || !performance || !mobcap) {
        return interaction.editReply(
          'Something went wrong trying to get information about that server!',
        );
      }

      const playerlist =
        status.players.list.join('\n') || 'There is currently nobody online.';

      const statusEmbed = new KoalaEmbedBuilder(interaction.user, {
        title: `${interaction.guild.name} ${choice.toUpperCase()}`,
        color: config.embedColors.green,
        fields: [
          { name: 'Status', value: 'Online' },
          { name: 'Version', value: `${status.version}` },
          {
            name: 'Performance',
            value: `**${performance.mspt}** MSPT | **${performance.tps}** TPS`,
          },
          {
            name: 'Hostile Mobcaps',
            value: `Overworld: ${mobcap.overworld}\nThe Nether: ${mobcap.the_nether}\nThe End: ${mobcap.the_end}`,
          },
          {
            name: 'Playercount',
            value: `online: **${status.players.online}** | max: **${status.players.max}**`,
          },
          {
            name: 'Playerlist',
            value: playerlist,
          },
        ],
      });

      const { mspt } = performance;

      if (mspt >= 30 && mspt < 40) {
        statusEmbed.setColor(config.embedColors.yellow);
      } else if (mspt >= 40 && mspt < 50) {
        statusEmbed.setColor(config.embedColors.orange);
      } else if (mspt >= 50) {
        statusEmbed.setColor(config.embedColors.red);
      }

      const guildIcon = interaction.guild.iconURL();

      if (guildIcon) {
        statusEmbed.setThumbnail(guildIcon);
      }

      return interaction.editReply({ embeds: [statusEmbed] });
    } catch (err) {
      getErrorMessage(err);
      return errorLog({
        interaction: interaction,
        errorMessage: `Failed to get the status of ${choice}!`,
      });
    }
  },
});
