import {
  AuditLogEvent,
  EmbedBuilder,
  userMention,
  time,
  inlineCode,
} from 'discord.js';
import logChannels from '../util/discord_helpers/loggers.js';
import buildModerationEmbed from '../util/discord_helpers/moderationEmbed.js';

export const event = {
  name: 'guildMemberRemove',
  async execute(member) {
    console.log(`${member.user.tag} left ${member.guild.name}.`);
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });

    const { memberLog, modLog } = logChannels(member.guild);
    // * protect the embed from breaking because joinedAt might not be properly cached
    const joinedAt = member.joinedAt
      ? `\nJoined at: ${time(member.joinedAt, 'f')} (${time(
          member.joinedAt,
          'R',
        )})`
      : '\u200b';

    const userLeaveEmbed = new EmbedBuilder({
      author: {
        name: member.user.tag,
        icon_url: member.user.displayAvatarURL(),
      },
      color: 3_092_790,
      description: `Username: ${userMention(
        member.user.id,
      )}\nUser ID: ${inlineCode(member.user.id)}${joinedAt}\nLeft at: ${time(
        new Date(),
        'f',
      )} (${time(new Date(), 'R')})`,
      footer: {
        text: 'User left',
      },
      timestamp: Date.now(),
    });

    memberLog.send({ embeds: [userLeaveEmbed] });

    const kickLog = fetchedLogs.entries.first();
    if (!kickLog) return;

    const { executor, target, reason } = kickLog;
    const executingMember = await member.guild.members.fetch(executor.id);

    if (target.id === member.id) {
      console.log(`${member.user.tag} was kicked from ${member.guild.name}.`);

      const kickEmbed = buildModerationEmbed(
        member,
        'Kick',
        reason,
        executingMember,
      );

      modLog.send({ embeds: [kickEmbed] });
    }
  },
};
