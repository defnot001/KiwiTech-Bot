import { AuditLogEvent, inlineCode } from 'discord.js';
import guildconfig from '../config/guildConfig.js';

export const event = {
  name: 'guildBanAdd',
  async execute(ban) {
    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    });

    const botLogChannel = ban.guild.channels.cache.get(
      guildconfig.botLogsChannelId,
    );
    const banLog = fetchedLogs.entries.first();

    if (!banLog) {
      botLogChannel.send(
        `${inlineCode(ban.user.tag)} (<@${ban.user.id}>) was banned from ${
          ban.guild.name
        } but no audit log could be found.`,
      );
      return;
    }

    const { executor, target } = banLog;

    if (target.id === ban.user.id) {
      botLogChannel.send(
        `${inlineCode(ban.user.tag)} (<@${
          ban.user.id
        }>) got hit with the swift hammer of justice in the guild ${inlineCode(
          ban.guild.name,
        )}, wielded by the mighty ${inlineCode(executor.tag)} (<@${
          executor.id
        }>)!`,
      );
    } else {
      botLogChannel.send(
        `${inlineCode(ban.user.tag)} (<@${
          ban.user.id
        }>) got hit with the swift hammer of justice in the guild ${inlineCode(
          ban.guild.name,
        )}, audit log fetch was inconclusive.`,
      );
    }
  },
};
