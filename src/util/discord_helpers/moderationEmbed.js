import { EmbedBuilder, inlineCode } from 'discord.js';

const buildModerationEmbed = (action, member, executor) => {
  const memberID = member.user.id;
  const moderationEmbed = new EmbedBuilder({
    author: {
      name: executor.user.tag,
      icon_url: executor.user.displayAvatarURL(),
    },
    timestamp: Date.now(),
  });

  if (action === 'kick') {
    moderationEmbed
      .setColor('Orange')
      .setDescription(
        `**Member**: ${userMention(
          memberID,
        )} (${id})\n**Action**: Kick\n**Reason**: ${reason}`,
      );
  }
};
