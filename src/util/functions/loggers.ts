import type { Guild } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';
import type { IInteractionErrorOptions } from '../../typings/interfaces/Errors';
import { isTextChannel } from './typeChecks';

export const errorLog = async (options: IInteractionErrorOptions) => {
  const { interaction, errorMessage } = options;

  if (!interaction.guild) {
    throw new Error('This interaction was not created in a guild!');
  }

  const errorLog = await getLogChannels(interaction.guild);

  if (!interaction.client.user) {
    throw new Error('This client does not have a user!');
  }

  if (interaction.deferred) {
    interaction.editReply(errorMessage);
  } else if (interaction.isRepliable()) {
    interaction.reply(errorMessage);
  }

  const clientUser = interaction.client.user;

  const interactionErrorEmbed = new EmbedBuilder({
    author: {
      name: clientUser.username,
      iconURL: clientUser.displayAvatarURL(),
    },
    description: `${errorMessage}`,
    color: config.embedColors.red,
    footer: {
      text: `${clientUser.username} Error Log`,
    },
    timestamp: Date.now(),
  });

  errorLog.send({ embeds: [interactionErrorEmbed] });
};

export const getLogChannels = async (guild: Guild) => {
  const errorLogChannel = await guild.channels.fetch(config.channels.botLog);

  if (!errorLogChannel || !isTextChannel(errorLogChannel)) {
    throw new Error('Cannot get the error-log channel!');
  }

  return errorLogChannel;
};
