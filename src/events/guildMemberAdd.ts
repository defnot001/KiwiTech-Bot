import { inlineCode, time, userMention } from 'discord.js';
import { Event } from 'djs-handlers';
import { JoinLeaveEmbedBuilder } from '../classes/JoinLeaveEmbedBuilder';
import { colorFromDuration, getJoinedAtComponent } from '../util/helpers';
import { getTextChannelFromID } from '../util/loggers';
export default new Event('guildMemberAdd', async (member) => {
  console.log(`${member.user.tag} joined ${member.guild.name}.`);

  const memberLog = await getTextChannelFromID(member.guild, 'memberLog');
  const joinedAt = getJoinedAtComponent(member);

  const accountAge: number =
    new Date().valueOf() - member.user.createdAt.valueOf();

  const embedColor: number = colorFromDuration(accountAge) || 3_092_790;

  const joinEmbed = new JoinLeaveEmbedBuilder(member, 'joined', {
    description: `Username: ${userMention(
      member.user.id,
    )}\nUser ID: ${inlineCode(member.user.id)}${joinedAt}\nCreated at: ${time(
      member.user.createdAt,
      'f',
    )} (${time(member.user.createdAt, 'R')})`,
    color: embedColor,
  });

  memberLog.send({ embeds: [joinEmbed] });
});
