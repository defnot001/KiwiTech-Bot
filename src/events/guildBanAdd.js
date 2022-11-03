import { AuditLogEvent, inlineCode } from 'discord.js';
import guildconfig from '../config/guildConfig.js';

export const event = {
  name: 'guildBanAdd',
  async execute(bannedMember) {
    console.log(
      `${bannedMember.user.tag} was banned from ${bannedMember.guild.name}.`,
    );

    const fetchedLogs = await ban.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberBanAdd,
    });

    const banLog = fetchedLogs.entries.first();
    if (!banLog) return;

    const { executor, target } = banLog;
    const reason = banLog.reason || 'No reason provided';
    const executingMember = await bannedMember.guild.members.fetch(executor.id);

    if (target.id === bannedMember.id) {
      console.log(
        `${bannedMember.user.tag} was banned from ${bannedMember.guild.name}.`,
      );

      const banEmbed = buildModerationEmbed(
        bannedMember,
        'Ban',
        reason,
        executingMember,
      );

      modLog.send({ embeds: [banEmbed] });
    }
  },
};
