import { Event } from 'djs-handlers';
import { client } from '..';
import dictionary119 from '../assets/dictionary_1.19';
import { customScoreboards } from '../commands/scoreboard';
import type { TServerChoice } from '../types/minecraft';
import { getModNames } from '../util/pterodactyl';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.isAutocomplete()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return console.error(
      `No command matching ${interaction.commandName} was found.`,
    );
  }

  const focused = interaction.options.getFocused(true);

  const mapChoices = (choices: string[]) => {
    return choices
      .filter((choice) => choice.startsWith(focused.value))
      .slice(0, 25)
      .map((choice) => ({ name: choice, value: choice }));
  };

  if (interaction.commandName === 'scoreboard') {
    const objectives = Object.keys(dictionary119).map((key) => key);
    const action = interaction.options.getString('action');

    if (!action) return interaction.respond([]);

    if (action === 'custom') {
      interaction.respond(mapChoices(customScoreboards));
    } else {
      const targetObjectives = objectives
        .filter((obj) => obj.startsWith(action))
        .map((item) => item.replace(action, ''));

      interaction.respond(mapChoices(targetObjectives));
    }
  } else if (interaction.commandName === 'mods') {
    const subcommand = interaction.options.getSubcommand();
    const serverChoice = interaction.options.getString('server') as
      | TServerChoice
      | undefined;

    if (!subcommand || !serverChoice) {
      return interaction.respond([]);
    }

    const modNames = await getModNames(serverChoice);
    const modNamesChoice =
      subcommand === 'enable' ? modNames.disabled : modNames.enabled;

    return interaction.respond(mapChoices(modNamesChoice));
  }
});
