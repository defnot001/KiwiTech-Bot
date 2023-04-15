import { registerFont, createCanvas } from 'canvas';
import { ApplicationCommandOptionType, inlineCode } from 'discord.js';
import { Command } from 'djs-handlers';
import path from 'path';
import dictionary119 from '../assets/dictionary_1.19';
import { projectPaths } from '../config';
import type { TScoreboards } from '../types/minecraft';
import { handleInteractionError } from '../util/loggers';
import { getEventMap, getPlayerScore, getPlaytimeMap, queryScoreboard } from '../util/rcon';

export const customScoreboardObjectives = [
  'digs',
  'deaths',
  'bedrock_removed',
  'playtime',
  // 'digevent',
];

const scoreboardObjectives = [...Object.keys(dictionary119).map((key) => key), ...customScoreboardObjectives];

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
] as const;

export default new Command({
  name: 'scoreboard',
  description: 'Shows the scoreboard for a given objective.',
  options: [
    {
      name: 'leaderboard',
      description: 'Gets a leaderboard for a given objective.',
      type: ApplicationCommandOptionType.Subcommand,
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
    },
    {
      name: 'players',
      description: 'Gets the scoreboard of a specific player.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'playername',
          description: 'The player you want the scores for.',
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
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
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const subcommand = args.getSubcommand() as 'leaderboard' | 'players';
    const action = args.getString('action', true) as typeof choices[number]['value'];

    const displayAction = choices.find((choice) => {
      return action === choice.value;
    })?.name;

    if (!displayAction) {
      return interaction.editReply('Cannot find action name to display!');
    }

    const item = args.getString('item', true);

    const scoreboardName = (action !== 'custom' ? action + item : item) as TScoreboards;

    if (!scoreboardObjectives.includes(scoreboardName)) {
      return interaction.editReply('This objective does not exist!');
    }

    try {
      if (subcommand === 'leaderboard') {
        let scoreboardMap: Map<string, number>;

        if (item === 'digevent') {
          scoreboardMap = await getEventMap();
        } else if (item === 'playtime') {
          scoreboardMap = await getPlaytimeMap();
        } else {
          scoreboardMap = await queryScoreboard(scoreboardName as TScoreboards);
        }

        if (scoreboardMap.size === 0) {
          return interaction.editReply('There are no entries on that scoreboard yet.');
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
      }

      if (subcommand === 'players') {
        const ingameName = args.getString('playername', true);

        const score = await getPlayerScore(ingameName, scoreboardName);

        if (score === undefined) {
          return interaction.editReply(`Cannot find score ${scoreboardName} for ${ingameName}!`);
        }

        const val = scoreboardName !== 'playtime' ? score : Math.round(score / 20 / 3600);

        return interaction.editReply(
          `Player _${ingameName}_ has ${inlineCode(val.toString())} for scoreboard: **${displayAction} ${item}**.`,
        );
      }
    } catch (err) {
      return handleInteractionError({
        interaction,
        err,
        message: `There was an error trying to query scoreboard ${inlineCode(displayAction)}`,
      });
    }
  },
});

registerFont(path.join(projectPaths.sources, 'assets/minecraft.ttf'), {
  family: 'minecraft',
});

function scoreboardToImage(scoreboardName: string, scoreboardData: [string, number][]) {
  const enum ScoreboardConstants {
    gray = '#BFBFBF',
    red = '#FF5555',
    white = '#FFFFFF',
    width = 250,
    spacing = 20,
  }

  const canvas = createCanvas(250, 0);
  const ctx = canvas.getContext('2d');

  const height = scoreboardData.length * ScoreboardConstants.spacing + 55;
  canvas.height = height;

  ctx.fillStyle = '#2c2f33';
  ctx.fillRect(0, 0, ScoreboardConstants.width, height);

  ctx.font = '20px minecraft';

  const titleSize = ctx.measureText(scoreboardName);

  let scoreboardTitle = scoreboardName;

  if (titleSize.width > ScoreboardConstants.width - 10) {
    let title = scoreboardName;
    let width = titleSize.width;

    while (width > ScoreboardConstants.width - 30) {
      title = title.slice(0, -1);
      width = ctx.measureText(title).width;
    }
    scoreboardTitle = `${title}...`;
  }

  const titlePos = [Math.floor((ScoreboardConstants.width - ctx.measureText(scoreboardTitle).width) / 2), 20];
  const playerAndScorePos: [number, number] = [2, 50];

  if (!titlePos[0] || !titlePos[1]) {
    throw new Error('Failed to get title position.');
  }

  // Write title
  ctx.fillStyle = ScoreboardConstants.white;
  ctx.fillText(scoreboardTitle, titlePos[0], titlePos[1], 240);

  let counter = 0;
  let total = 0;
  scoreboardData.forEach((i) => {
    // Write the player name
    ctx.fillStyle = ScoreboardConstants.gray;
    ctx.fillText(i[0], playerAndScorePos[0], playerAndScorePos[1] + counter * ScoreboardConstants.spacing);

    // Write the score
    ctx.fillStyle = ScoreboardConstants.red;
    ctx.fillText(
      i[1].toString(),
      ScoreboardConstants.width - ctx.measureText(i[1].toString()).width,
      playerAndScorePos[1] + counter * ScoreboardConstants.spacing,
    );

    counter += 1;
    total += i[1];
  });

  // Write the total score (in red)
  ctx.fillText(
    String(total),
    ScoreboardConstants.width - ctx.measureText(String(total)).width,
    playerAndScorePos[1] + counter * ScoreboardConstants.spacing,
  );

  // Write 'Total' text
  ctx.fillStyle = ScoreboardConstants.white;
  ctx.fillText('Total', playerAndScorePos[0], playerAndScorePos[1] + counter * ScoreboardConstants.spacing);

  return canvas.toBuffer('image/png');
}
