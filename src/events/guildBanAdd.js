import { AuditLogEvent, inlineCode } from 'discord.js';
import guildconfig from '../config/guildConfig.js';

export const event = {
  name: 'guildBanAdd',
  async execute(ban) {
    console.log(`${ban.user.tag} was banned from ${ban.guild.name}.`);

    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    });

    const modLogChannel = ban.guild.channels.cache.get(
      guildconfig.modLogChannelId,
    );
    const banLog = fetchedLogs.entries.first();

    if (!banLog) return;

    const { executor, target } = banLog;

    if (target.id === ban.user.id) {
      modLogChannel.send(
        `${inlineCode(ban.user.tag)} (<@${
          ban.user.id
        }>) got hit with the swift hammer of justice in the guild ${inlineCode(
          ban.guild.name,
        )}, wielded by the mighty ${inlineCode(executor.tag)} (<@${
          executor.id
        }>)!`,
      );
    } else {
      modLogChannel.send(
        `${inlineCode(ban.user.tag)} (<@${
          ban.user.id
        }>) got hit with the swift hammer of justice in the guild ${inlineCode(
          ban.guild.name,
        )}, audit log fetch was inconclusive.`,
      );
    }
  },
};
