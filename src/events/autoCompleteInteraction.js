import dictionary119 from '../assets/dictionary_1.19.js';

const objectives = Object.keys(dictionary119).map((key) => key);

export const event = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isAutocomplete()) return;

    if (interaction.commandName === 'scoreboard') {
      const focusedOption = interaction.options.getFocused(true);
      // eslint-disable-next-line no-underscore-dangle
      const actionOption = interaction.options._hoistedOptions.find(
        (x) => x.name === 'action'
      );
      // <action> isn't supplied
      if (!actionOption) {
        await interaction.respond({});
      } else {
        const filtered = objectives.filter((choice) =>
          choice.startsWith(`${actionOption.value}${focusedOption.value}`)
        );
        await interaction.respond(
          filtered.slice(0, 25).map((choice) => ({
            name: choice.replace(actionOption.value, ''),
            value: choice,
          }))
        );
      }
    }
  },
};
