import { EmbedBuilder, Guild, GuildMember } from 'discord.js';
import { z } from 'zod';
import { client } from '..';
import { config } from '../config';
import { getTextChannelFromID } from './loggers';

export type ApplicationPostHeaders = {
  host: string;
  'user-agent': string;
  'content-length': string;
  'accept-encoding': string;
  'content-type': string;
  'x-forwarded-for': string;
  'x-forwarded-proto': string;
};

export type ApplicationObject = {
  timestamp: Date;
  discordName: string;
  ign: string;
  pronouns: string;
  age: string;
  timezone: string;
  languages: string;
  minecraftExperienceTime: string;
  otherExperience: string;
  fields: string[];
  informationSource: string;
  reason: string;
  timeAvailable: string;
  msptAndTps: string;
  mobSpawning: string;
  updateSuppression: string;
  zeroTick: string;
  pastBuilds: string;
  suggestions: string;
};

export type ApplicationBody = z.infer<typeof applicationBodySchema>;

const applicationBodySchema = z.object({
  'What is your discord username? (Eg: @tmcplayer)': z.string(),
  'What is your in game name?': z.string(),
  'What pronouns do you use?': z.string(),
  'How old are you?': z.string(),
  'What is your timezone?': z.string(),
  'What languages do you speak?': z.string(),
  'How long have you been playing Minecraft?': z.string(),
  'What is your experience on other technical minecraft servers? (please specify)': z.string(),
  'What fields of TMC are you specialised in? ': z.array(z.string()),
  'Where did you hear about KiwiTech?': z.string(),
  'Why do you want to apply on KiwiTech?': z.string(),
  'How much time can you dedicate to KiwiTech per week? (rough estimate)': z.string(),
  'What do the terms MSPT and TPS stand for and why are they important?': z.string(),
  'How does mob spawning work in minecraft?': z.string(),
  'What is update suppression and how does it work?': z.string(),
  "Explain zero ticking mechanics (it's not about force growth):": z.string(),
  'Link images of past builds / farms YOU’ve done:': z.string(),
  'Anything else you want to tell us? How can we improve our application?': z.string(),
});

export function parseApplication(body: ApplicationBody): ApplicationObject | null {
  try {
    const parsedValues = applicationBodySchema.parse(body);

    const parsedApplication = {
      timestamp: new Date(),
      discordName: parsedValues['What is your discord username? (Eg: @tmcplayer)'],
      ign: parsedValues['What is your in game name?'],
      pronouns: parsedValues['What pronouns do you use?'],
      age: parsedValues['How old are you?'],
      timezone: parsedValues['What is your timezone?'],
      languages: parsedValues['What languages do you speak?'],
      minecraftExperienceTime: parsedValues['How long have you been playing Minecraft?'],
      otherExperience: parsedValues['What is your experience on other technical minecraft servers? (please specify)'],
      fields: parsedValues['What fields of TMC are you specialised in? '],
      informationSource: parsedValues['Where did you hear about KiwiTech?'],
      reason: parsedValues['Why do you want to apply on KiwiTech?'],
      timeAvailable: parsedValues['How much time can you dedicate to KiwiTech per week? (rough estimate)'],
      msptAndTps: parsedValues['What do the terms MSPT and TPS stand for and why are they important?'],
      mobSpawning: parsedValues['How does mob spawning work in minecraft?'],
      updateSuppression: parsedValues['What is update suppression and how does it work?'],
      zeroTick: parsedValues["Explain zero ticking mechanics (it's not about force growth):"],
      pastBuilds: parsedValues['Link images of past builds / farms YOU’ve done:'],
      suggestions: parsedValues['Anything else you want to tell us? How can we improve our application?'],
    };

    return parsedApplication;
  } catch {
    return null;
  }
}

export async function postApplicationToChannel(application: ApplicationObject, guild: Guild) {
  const embedOne = new EmbedBuilder({
    title: `${application.discordName} Application`,
    color: config.embedColors.default,
    fields: [
      { name: 'Discord Name', value: application.discordName, inline: true },
      { name: 'IGN', value: application.ign, inline: true },
      { name: 'Pronouns', value: application.pronouns, inline: true },
      { name: 'Age', value: application.age, inline: true },
      { name: 'Timezone', value: application.timezone, inline: true },
      { name: 'Languages', value: application.languages, inline: true },
      { name: 'How long have you been playing Minecraft?', value: application.minecraftExperienceTime },
      { name: 'What is your experience on other technical minecraft servers?', value: application.otherExperience },
      { name: 'What fields of TMC are you specialised in?', value: application.fields.join(', ') },
      { name: 'Where did you hear about KiwiTech?', value: application.informationSource },
      { name: 'Why do you want to apply to KiwiTech?', value: application.reason },
      { name: 'How much time can you dedicate to KiwiTech per week?', value: application.timeAvailable },
    ],
    footer: {
      text: '1/3 General Information',
    },
    timestamp: application.timestamp,
  });

  const embedTwo = new EmbedBuilder({
    color: config.embedColors.default,
    fields: [
      { name: 'MSPT & TPS', value: application.msptAndTps },
      {
        name: 'Mob Spawning',
        value: application.mobSpawning,
      },
      {
        name: 'Update Suppression',
        value: application.updateSuppression,
      },
      {
        name: 'Zero Ticking',
        value: application.zeroTick,
      },
    ],
    footer: {
      text: '2/3 Technical Knowledge',
    },
    timestamp: application.timestamp,
  });

  const embedThree = new EmbedBuilder({
    color: config.embedColors.default,
    fields: [
      { name: 'Images', value: application.pastBuilds },
      {
        name: 'Suggestions',
        value: application.suggestions,
      },
    ],
    footer: {
      text: '3/3 Images & Suggestions',
    },
    timestamp: application.timestamp,
  });

  if (!client.user) {
    throw new Error('Client user not found');
  }

  const botLogChannel = await getTextChannelFromID(guild, 'botLog');
  const applicationChannel = await getTextChannelFromID(guild, 'application');

  try {
    const discordName = application.discordName.replace('@', '');
    const member = await getGuildMemberFromUsername(discordName, guild);

    if (!member) {
      const memberErrorEmbed = new EmbedBuilder({
        author: {
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        },
        description: `Could not find member ${application.discordName} in the guild. Please link the application to the member manually using the /application link command.`,
        color: config.embedColors.red,
        footer: {
          text: `${client.user.username} Error Log`,
        },
        timestamp: Date.now(),
      });

      botLogChannel.send({ embeds: [memberErrorEmbed] });
      return;
    }

    embedOne.setThumbnail(member.user.displayAvatarURL());

    await applicationChannel.send({
      embeds: [embedOne, embedTwo, embedThree],
    });

    try {
      const applicationErrorEmbed = new EmbedBuilder({
        author: {
          name: client.user.username,
          iconURL: client.user.displayAvatarURL(),
        },
        description: `Application from ${application.discordName} could not be posted to application channel.`,
        color: config.embedColors.red,
        footer: {
          text: `${client.user.username} Error Log`,
        },
        timestamp: Date.now(),
      });

      botLogChannel.send({ embeds: [applicationErrorEmbed] });
    } catch {
      throw new Error('Bot log channel not found');
    }
  } catch {
    throw new Error('Member not found');
  }
}

export async function getGuildMemberFromUsername(username: string, guild: Guild): Promise<GuildMember | null> {
  const memberCollection = await guild.members.fetch({
    query: username,
    limit: 1,
  });

  const member = memberCollection.first();

  if (!member) {
    return null;
  }

  return member;
}
