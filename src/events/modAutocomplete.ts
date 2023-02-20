import { Event } from 'djs-handlers';
import { client } from '..';
import type { TServerChoice } from '../types/minecraft';
import { getModFiles } from '../util/pterodactyl';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.isAutocomplete()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return console.error(
      `No command matching ${interaction.commandName} was found.`,
    );
  }

  if (interaction.commandName === 'mods') {
    const focused = interaction.options.getFocused(true);
    const subcommand = interaction.options.getSubcommand(true);
    const serverChoice = interaction.options.getString('server') as
      | TServerChoice
      | undefined;

    if (!subcommand || !serverChoice) {
      return interaction.respond([]);
    }

    const modFiles = await getModFiles(serverChoice);

    const mods = {
      enabled: modFiles.filter((mod) => {
        return mod.name.endsWith('.jar');
      }),
      disabled: modFiles.filter((mod) => {
        return mod.name.endsWith('.disabled');
      }),
    };

    const modNames = {
      enabled: mods.enabled.map((mod) => {
        return mod.name.replace('.jar', '');
      }),
      disabled: mods.disabled.map((mod) => {
        return mod.name.replace('.disabled', '');
      }),
    };

    if (subcommand === 'enable') {
      const filtered = modNames.disabled.filter((choice) =>
        choice.startsWith(focused.value),
      );

      interaction.respond(
        filtered
          .slice(0, 25)
          .map((choice) => ({ name: choice, value: choice })),
      );
    } else if (subcommand === 'disable') {
      const filtered = modNames.enabled.filter((choice) =>
        choice.startsWith(focused.value),
      );

      interaction.respond(
        filtered
          .slice(0, 25)
          .map((choice) => ({ name: choice, value: choice })),
      );
    } else {
      interaction.respond([]);
    }
  }
});
