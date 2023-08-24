import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from 'djs-handlers';
import fs from 'fs';
import path from 'path';
import { KoalaEmbedBuilder } from '../classes/KoalaEmbedBuilder';

export default new Command({
  name: 'help',
  description: 'Get information on how to use things on SMP.',
  options: [
    {
      name: 'thing',
      description: 'The thing you want to get information about.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: 'Mobswitches',
          value: 'Mobswitches',
        },
        {
          name: 'Bed Bot',
          value: 'Bed Bot',
        },
        {
          name: '10gt Raid Farm',
          value: '10gt Raid Farm',
        },
        {
          name: 'Mushroom Farms',
          value: 'Mushroom Farms',
        },
      ],
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const choice = args.getString('thing', true);

    const helpDirPath = path.join(__dirname, '../../documents/help');
    const helpDocContent = fs.readFileSync(path.join(helpDirPath, `${choice}.md`), 'utf-8');

    const embed = new KoalaEmbedBuilder(interaction.user, {
      description: helpDocContent,
    });

    await interaction.editReply({ embeds: [embed] });
  },
});
