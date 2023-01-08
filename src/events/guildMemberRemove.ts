import { AuditLogEvent, inlineCode, time, userMention } from 'discord.js';
import { Event } from '../structures/Event';
import { JoinLeaveEmbedBuilder } from '../structures/embeds/JoinLeaveEmbedBuilder';
import { ModerationEmbedBuilder } from '../structures/embeds/ModerationEmbedBuilder';
import { getJoinedAtComponent } from '../util/functions/helpers';
import {
  createEventErrorLog,
  getTextChannelFromID,
} from '../util/functions/loggers';

export default new Event('guildMemberRemove', async (member) => {
  try {
    // handle member leaving the guild (this should always run, even if the member was kicked or banned):

    console.log(`${member.user.tag} left ${member.guild.name}`);

    const joinedAt = getJoinedAtComponent(member);
    const memberLog = await getTextChannelFromID(member.guild, 'memberLog');

    const userLeaveEmbed = new JoinLeaveEmbedBuilder(member, 'left', {
      description: `Username: ${userMention(
        member.user.id,
      )}\nUser ID: ${inlineCode(member.user.id)}${joinedAt}\nLeft at: ${time(
        new Date(),
        'f',
      )} (${time(new Date(), 'R')})`,
    });

    memberLog.send({ embeds: [userLeaveEmbed] });

    // handle member being kicked from the guild:

    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: AuditLogEvent.MemberKick,
    });

    const kickLog = fetchedLogs.entries.first();

    if (!kickLog) {
      throw new Error('Cannot find kickLog.');
    }

    const { executor, target, action, reason } = kickLog;

    if (!executor || !target || action !== AuditLogEvent.MemberKick) {
      throw new Error('Cannot find executor or target from the Audit Log.');
    }

    const executingMember = await member.guild.members.fetch(executor.id);
    const modLog = await getTextChannelFromID(member.guild, 'modLog');

    if (target.id === member.user.id) {
      console.log(`${member.user.tag} was kicked from ${member.guild.name}.`);

      const kickEmbed = new ModerationEmbedBuilder({
        target: member.user,
        executor: executingMember,
        action: 'kick',
        reason: reason,
      });

      modLog.send({ embeds: [kickEmbed] });
    } else {
      throw new Error(
        'The IDs of the target in the AuditLog and the target from the Event did not match.',
      );
    }
  } catch (err) {
    console.error(err);
    createEventErrorLog({
      client: member.client,
      guild: member.guild,
      errorMessage: `${inlineCode(
        'GuildMemberRemove',
      )} Event triggered but the embed could not be sent.`,
    });
  }
});