import { SlashCommandBuilder } from 'discord.js';
import buildDefaultEmbed from '../util/discord_helpers/defaultEmbed.js';
import generateServerChoices from '../util/discord_helpers/serverChoices.js';
import getServerStatus from '../util/mcserver/serverStatus.js';
import queryMSPT from '../util/mcserver/queryMSPT.js';
import queryMobcap from '../util/mcserver/queryMobcap.js';
import mcconfig from '../config/mcConfig.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Get the status of a Minecraft Server.')
    .addStringOption((option) =>
      option
        .setName('server')
        .setDescription('The server you want info about.')
        .setRequired(true)
        .addChoices(...generateServerChoices())
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const choice = interaction.options.getString('server');
    const { host, port, rconPort, rconPassword } = mcconfig[choice];

    try {
      const result = await getServerStatus(host, port);
      const playerlist =
        result.players.list.join('\n') || 'There is currently nobody online!';

      const { mspt, tps } = await queryMSPT(host, rconPort, rconPassword);
      const mobcap = await queryMobcap(host, rconPort, rconPassword);

      const statusEmbed = buildDefaultEmbed(interaction.user)
        .setTitle(`KiwiTech ${choice.toUpperCase()}`)
        .setThumbnail(interaction.guild.iconURL())
        .addFields([
          { name: 'Status', value: 'Online' },
          { name: 'Version', value: result.version },
          { name: 'Performance', value: `**${mspt}** mspt | **${tps}** TPS` },
          {
            name: 'Hostile Mobcaps',
            value: `Overworld: ${mobcap.overworld}\nThe Nether: ${mobcap.the_nether}\nThe End: ${mobcap.the_end}`,
          },
          {
            name: 'Playercount',
            value: `online: **${result.players.online}** | max: **${result.players.max}**`,
          },
          { name: 'Playerlist', value: playerlist },
        ]);

      statusEmbed.setColor('Green');

      if (mspt > 30 && mspt < 50) {
        statusEmbed.setColor('Yellow');
      } else if (mspt >= 50) {
        statusEmbed.setColor('Red');
      }

      await interaction.editReply({ embeds: [statusEmbed] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Server offline or unreachable!');
    }
  },
};
