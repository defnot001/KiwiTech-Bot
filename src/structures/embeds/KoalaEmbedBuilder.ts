import { APIEmbed, EmbedBuilder, EmbedData, type User } from 'discord.js';
import { config } from '../../config/config';

export class KoalaEmbedBuilder extends EmbedBuilder {
  constructor(user: User, data?: EmbedData | APIEmbed) {
    super(data);

    this.setColor(config.embedColors.default);

    this.setFooter({
      text: `Requested by ${user.username}`,
      iconURL: user.displayAvatarURL(),
    });

    this.setTimestamp(Date.now());
  }
}
