import axios from 'axios';
import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from 'djs-handlers';
import { handleInteractionError } from '../util/loggers';

export default new Command({
  name: 'animal',
  description: 'Get random pictures from animals.',
  options: [
    {
      name: 'animal',
      description: 'Select an animal.',
      type: ApplicationCommandOptionType.String,
      choices: [
        { name: 'Fox', value: 'fox' },
        { name: 'Cat', value: 'cat' },
        { name: 'Dog', value: 'dog' },
      ],
      required: true,
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const choice = args.getString('animal', true) as 'fox' | 'cat' | 'dog';

    const apiURL = {
      fox: 'https://randomfox.ca/floof/',
      cat: 'https://api.thecatapi.com/v1/images/search',
      dog: 'https://api.thedogapi.com/v1/images/search',
    } as const;

    try {
      const { data } = await axios.get(apiURL[choice]);
      const imageURL: string = choice === 'fox' ? data.image : data[0].url;

      interaction.editReply({ files: [imageURL] });
      return;
    } catch (err) {
      handleInteractionError({
        interaction,
        err,
        message: `Something went wrong trying to get a picture of a ${choice}.`,
      });
      return;
    }
  },
});
