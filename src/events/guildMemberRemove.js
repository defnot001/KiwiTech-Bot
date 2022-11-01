import {
  AuditLogEvent,
  EmbedBuilder,
  userMention,
  time,
  inlineCode,
} from 'discord.js';
import guildconfig from '../config/guildConfig.js';

export const event = {
  name: 'guildMemberRemove',
  async execute(member) {
    console.log(`${member.user.tag} left ${member.guild.name}.`);
    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });

    const memberLogChannel = member.guild.channels.cache.get(
      guildconfig.memberLogChannelId,
    );
    const modLogChannel = member.guild.channels.cache.get(
      guildconfig.modLogChannelId,
    );

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

    memberLogChannel.send({ embeds: [userLeaveEmbed] });

    const kickLog = fetchedLogs.entries.first();
    if (!kickLog) return;

    const { executor, target } = kickLog;

    // TODO: Turn this into a moderation log event
    if (target.id === member.id) {
      console.log(`${member.user.tag} was kicked from ${member.guild.name0}.`);

      modLogChannel.send(
        `${inlineCode(member.user.tag)} (<@${
          member.user.id
        }>) left the guild. They were kicked by the mighty ${inlineCode(
          executor.tag,
        )} (<@${executor.id}>)!`,
      );
    }
  },
};
