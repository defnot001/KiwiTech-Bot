import { client } from '..';
import { customScoreboards } from '../assets/customScoreboards';
import dictionary119 from '../assets/dictionary_1.19';
import { Event } from '../structures/Event';

const objectives = Object.keys(dictionary119).map((key) => key);

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.isAutocomplete()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return console.error(
      `No command matching ${interaction.commandName} was found.`,
    );
  }

  if (interaction.commandName === 'scoreboard') {
    const focused = interaction.options.getFocused(true);
    const action = interaction.options.getString('action');

    if (!action) {
      interaction.respond([]);
    } else if (action === 'custom') {
      const choices = customScoreboards;

      const filtered = choices.filter((choice) =>
        choice.startsWith(focused.value),
      );

      interaction.respond(
        filtered.map((choice) => ({ name: choice, value: choice })),
      );
    } else {
      const targetObjectives = objectives
        .filter((obj) => obj.startsWith(action))
        .map((item) => item.replace(action, ''));

      const filtered = targetObjectives.filter((choice) =>
        choice.startsWith(focused.value),
      );

      interaction.respond(
        filtered
          .slice(0, 25)
          .map((choice) => ({ name: choice, value: choice })),
      );
    }
  }
});
