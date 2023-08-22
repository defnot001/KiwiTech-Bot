import { ApplicationCommandOptionType, escapeMarkdown, inlineCode, time } from 'discord.js';
import { Command } from 'djs-handlers';
import { KoalaEmbedBuilder } from '../classes/KoalaEmbedBuilder';
import { confirmCancelRow, getButtonCollector } from '../util/components';

export default new Command({
  name: 'idban',
  description: 'Bans a user by their ID.',
  options: [
    {
      name: 'target',
      description: 'The ID that you want to ban.',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  execute: async ({ client, interaction, args }) => {
    await interaction.deferReply();

    const interactionGuild = interaction.guild;

    if (!interactionGuild) {
      await interaction.editReply('This command can only be used in a server.');
      return;
    }

    const targetID = args.getString('target', true);
    const targetUser = await client.users.fetch(targetID.toString(), { force: true });

    if (!targetUser) {
      await interaction.editReply(`Unable to find user with ID ${inlineCode(targetID)}.`);
      return;
    }

    const userEmbed = new KoalaEmbedBuilder(interaction.user, {
      title: `User info for ${escapeMarkdown(targetUser.username)}`,
      thumbnail: {
        url: targetUser.displayAvatarURL(),
      },
      fields: [
        { name: 'Username', value: targetUser.username, inline: false },
        ...(targetUser.globalName ? [{ name: 'Global Name', value: targetUser.globalName }] : []),
        { name: 'User ID', value: targetUser.id, inline: false },
        {
          name: 'Joined Discord on',
          value: `${time(targetUser.createdAt, 'D')}\n(${time(targetUser.createdAt, 'R')})`,
          inline: true,
        },
      ],
    });

    await interaction.editReply({
      embeds: [userEmbed],
      content: 'Are you sure you want to ban this user?',
      components: [confirmCancelRow],
    });

    const collector = getButtonCollector(interaction);

    if (!collector) {
      interaction.editReply('Failed to create message component collector!');
      return;
    }

    collector.on('collect', async (i) => {
      if (i.customId === 'confirm') {
        await interaction.editReply({
          content: `Banning ${inlineCode(targetUser.username)}...`,
          components: [],
          embeds: [],
        });

        await interactionGuild.members.ban(targetUser.id, { reason: 'Banned by ID.' });

        await interaction.editReply(`Successfully banned ${inlineCode(targetUser.username)}!`);
        return;
      }

      if (i.customId === 'cancel') {
        await interaction.editReply({
          content: 'Cancelled ban.',
          components: [],
          embeds: [],
        });
        return;
      }
    });
  },
});
