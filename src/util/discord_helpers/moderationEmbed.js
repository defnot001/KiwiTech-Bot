import { EmbedBuilder, inlineCode } from 'discord.js';

const buildModerationEmbed = (
  member,
  action,
  reason,
  executor,
  expiration = null,
) => {
  const description = {
    member: `**Member**: ${member.user.tag} (${inlineCode(member.user.id)})`,
    action: `**Action**: ${action}`,
    reason: `**Reason**: ${reason}`,
    expiration: `**Expiration**: ${expiration}`,
  };

  const moderationEmbed = new EmbedBuilder({
    author: {
      name: executor.user.tag,
      icon_url: executor.user.displayAvatarURL(),
    },
    footer: { text: 'Moderation Logger' },
    timestamp: Date.now(),
  });

  if (action === 'Kick' || action === 'Ban') {
    moderationEmbed
      .setColor('Orange')
      .setDescription(
        `${description.member}\n${description.action}\n${description.reason}`,
      );
  } else if (action === 'Timeout') {
    moderationEmbed
      .setColor('Yellow')
      .setDescription(
        `${description.member}\n${description.action}\n${description.reason}\n${description.expiration}`,
      );
  }

  return moderationEmbed;
};

export default buildModerationEmbed;
