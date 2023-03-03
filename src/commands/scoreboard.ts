import { ApplicationCommandOptionType, inlineCode } from 'discord.js';
import { Command } from 'djs-handlers';
import dictionary119 from '../assets/dictionary_1.19';
import type { TScoreboards } from '../types/minecraft';
import { scoreboardToImage } from '../util/canvas';
import { handleInteractionError } from '../util/loggers';
import { getEventMap, getPlaytimeMap, queryScoreboard } from '../util/rcon';

export const customScoreboardObjectives = [
  'digs',
  'deaths',
  'bedrock_removed',
  'playtime',
  'digevent',
];

const scoreboardObjectives = [
  ...Object.keys(dictionary119).map((key) => key),
  ...customScoreboardObjectives,
];

const choices = [
  { name: 'mined', value: 'm-' },
  { name: 'used', value: 'u-' },
  { name: 'crafted', value: 'c-' },
  { name: 'broken (tools)', value: 'b-' },
  { name: 'picked up', value: 'p-' },
  { name: 'dropped', value: 'd-' },
  { name: 'killed', value: 'k-' },
  { name: 'killed by', value: 'kb-' },
  { name: 'custom', value: 'custom' },
];

export default new Command({
  name: 'scoreboard',
  description: 'Shows the scoreboard for a given objective.',
  options: [
    {
      name: 'action',
      description: 'The action to show the scoreboard for.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [...choices],
    },
    {
      name: 'item',
      description: 'The item to show the scoreboard for.',
      type: ApplicationCommandOptionType.String,
      required: true,
      autocomplete: true,
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const action = args.getString('action');
    const item = args.getString('item');

    if (!item || !action) {
      return interaction.editReply('Missing arguments for this command!');
    }

    const scoreboardName = action !== 'custom' ? action + item : item;

    if (!scoreboardObjectives.includes(scoreboardName)) {
      return interaction.editReply('This objective does not exist!');
    }

    try {
      let scoreboardMap: Map<string, number>;

      if (item === 'digevent') {
        scoreboardMap = await getEventMap();
      } else if (item === 'playtime') {
        scoreboardMap = await getPlaytimeMap();
      } else {
        scoreboardMap = await queryScoreboard(scoreboardName as TScoreboards);
      }

      if (scoreboardMap.size === 0) {
        return interaction.editReply(
          'There are no entries on that scoreboard yet.',
        );
      }

      const leaderboard = Array.from(scoreboardMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      const choice = choices.find((x) => x.value === action);

      if (!choice) {
        return interaction.editReply('This action does not exist!');
      }

      const prettyfiedObjective =
        action !== 'custom'
          ? scoreboardName.replace(action, choice.name + ' ')
          : item === 'playtime'
          ? 'playtime (hours)'
          : item;

      const buffer = scoreboardToImage(prettyfiedObjective, leaderboard);

      return interaction.editReply({ files: [{ attachment: buffer }] });
    } catch (err) {
      return handleInteractionError({
        interaction,
        err,
        message: `There was an error trying to query scoreboard ${inlineCode(
          scoreboardName,
        )}`,
      });
    }
  },
});
