import { Event } from 'djs-handlers';
import { client } from '..';
import dictionary119 from '../assets/dictionary_1.19';
import { customScoreboardObjectives } from '../commands/scoreboard';
import { config, ServerChoice } from '../config';
import { handleEventError } from '../util/loggers';
import { getAllTodos, getMemberNames } from '../util/prisma';
import { getModNames, ptero } from '../util/pterodactyl';
import { getWhitelist } from '../util/rcon';

export default new Event('interactionCreate', async (interaction) => {
  if (!interaction.isAutocomplete()) return;
  if (!interaction.guild) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    return console.error(`No command matching ${interaction.commandName} was found.`);
  }

  const guild = interaction.guild;

  if (!guild) return;

  const focused = interaction.options.getFocused(true);
  const subcommand = interaction.options.getSubcommand();

  const mapChoices = (choices: string[]) => {
    return choices
      .filter((choice) => choice.startsWith(focused.value))
      .slice(0, 25)
      .map((choice) => ({ name: choice, value: choice }));
  };

  try {
    if (interaction.commandName === 'scoreboard') {
      const objectives = Object.keys(dictionary119).map((key) => key);
      const action = interaction.options.getString('action');

      if (focused.name === 'playername') {
        const { host, rconPort, rconPasswd } = config.mcConfig['smp'];

        const whitelistNames = await getWhitelist(host, rconPort, rconPasswd);

        return interaction.respond(mapChoices(whitelistNames));
      } else if (focused.name === 'item') {
        if (action === 'custom') {
          return interaction.respond(mapChoices(customScoreboardObjectives));
        } else {
          if (!action) return interaction.respond([]);

          const targetObjectives = objectives
            .filter((obj) => obj.startsWith(action))
            .map((item) => item.replace(action, ''));

          return interaction.respond(mapChoices(targetObjectives));
        }
      }
    } else if (interaction.commandName === 'todo' && subcommand !== 'add') {
      const todoList = await getAllTodos();
      const todoListChoice = todoList.map((todo) => todo.title);

      return interaction.respond(mapChoices(todoListChoice));
    } else if (interaction.commandName === 'whitelist') {
      const totalWhitelist: string[] = [];

      for (const server in config.mcConfig) {
        if (server === 'snapshots') continue;

        const { host, rconPort, rconPasswd } = config.mcConfig[server as ServerChoice];

        const whitelistNames = await getWhitelist(host, rconPort, rconPasswd);

        totalWhitelist.push(...whitelistNames);
      }

      const whitelistNames = [...new Set(totalWhitelist)].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      );

      return interaction.respond(mapChoices(whitelistNames));
    } else if (interaction.commandName === 'mods') {
      const serverChoice = interaction.options.getString('server') as ServerChoice | undefined;

      if (!serverChoice) return interaction.respond([]);

      const modNames = await getModNames(serverChoice);
      const modNamesChoice = subcommand === 'enable' ? modNames.disabled : modNames.enabled;

      return interaction.respond(mapChoices(modNamesChoice));
    } else if (interaction.commandName === 'backup') {
      const serverChoice = interaction.options.getString('server') as ServerChoice | undefined;

      if (!serverChoice) return interaction.respond([]);
      const backupListResponse = await ptero.backups.list(config.mcConfig[serverChoice].serverId);

      const backupNames = backupListResponse.data.reverse().map((backup) => backup.name);

      return interaction.respond(mapChoices(backupNames));
    } else if (interaction.commandName === 'member') {
      return interaction.respond(mapChoices(await getMemberNames(guild.members)));
    }
  } catch (err) {
    return handleEventError({
      err,
      client: interaction.client,
      guild: interaction.guild,
      message: `Something went wrong trying to autocomplete for command ${interaction.commandName}!`,
    });
  }
});
