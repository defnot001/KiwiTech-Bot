import dictionary119 from '../assets/dictionary_1.19.js';

const dictionary = Object.keys(dictionary119).map((key) => key);
const custom = ['digs', 'deaths', 'bedrock_removed', 'event_dig'];

export const event = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isAutocomplete()) return;

    if (interaction.commandName === 'scoreboard') {
      const focusedValue = interaction.options.getFocused();
      const choices = [...dictionary, ...custom];
      const filtered = choices.filter((choice) =>
        choice.startsWith(focusedValue),
      );
      await interaction.respond(
        filtered
          .slice(0, 25)
          .map((choice) => ({ name: choice, value: choice })),
      );
    }
  },
};
