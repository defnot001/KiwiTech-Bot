import { ApplicationCommandOptionType, userMention } from 'discord.js';
import trialWelcomeMessage from '../assets/welcomeMessage';
import { config } from '../config/config';
import { Command } from '../structures/Command';
import { KoalaEmbedBuilder } from '../structures/embeds/KoalaEmbedBuilder';
import { isGuildMember } from '../util/functions/typeChecks';

export default new Command({
  name: 'trialinfo',
  description: 'Posts an embed with information for a new trial member.',
  options: [
    {
      name: 'target',
      description: 'Select a user.',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
  execute: async ({ interaction, args }) => {
    const target = args.getMember('target');

    if (!isGuildMember(target)) {
      return interaction.reply({
        content: 'The target you chose is not a member of this guild!',
        ephemeral: true,
      });
    }

    const trialEmbed = new KoalaEmbedBuilder(interaction.user, {
      title: `${config.emoji.kiwi}  Welcome to KiwiTech ${target.user.username}!  ${config.emoji.kiwi}`,
      thumbnail: {
        url: target.user.displayAvatarURL(),
      },
      fields: trialWelcomeMessage,
    });

    await interaction.reply({
      content: userMention(target.user.id),
      embeds: [],
    });

    return interaction.editReply({
      content: '\u200b',
      embeds: [trialEmbed],
    });
  },
});
