import { SlashCommandBuilder } from 'discord.js';
import queryScoreboard from '../util/mcserver/queryScoreboard.js';
import scoreboardToImage from '../util/canvas/scoreboardToImage.js';

const choices = [
  { name: 'Mined', value: 'm-' },
  { name: 'Used', value: 'u-' },
  { name: 'Crafted', value: 'c-' },
  { name: 'Broken (tools)', value: 'b-' },
  { name: 'Picked up', value: 'p-' },
  { name: 'Dropped', value: 'd-' },
  { name: 'Killed', value: 'k-' },
  { name: 'Killed by', value: 'kb-' },
];

export const command = {
  data: new SlashCommandBuilder()
    .setName('scoreboard')
    .setDescription('Get a scoreboard.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('query')
        .setDescription('Returns a Scoreboard with the chosen Values,')
        .addStringOption((option) =>
          option
            .setName('action')
            .setDescription('Action to search for.')
            .setRequired(true)
            .addChoices(...choices),
        )
        .addStringOption((option) =>
          option
            .setName('objective')
            .setDescription('Objective to search for.')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('custom')
        .setDescription('Returns a scoreboard with custom Values.')
        .addStringOption((option) =>
          option
            .setName('objective')
            .setDescription('Objective to search for.'),
        ),
    ),
  async execute(interaction) {
    // TODO: scoreboard for a player only
    // TODO: same display as ingame (only 15 players) or full display
    // TODO: add custom objective

    await interaction.deferReply();

    const objective = interaction.options.getString('objective');
    const action = interaction.options.getString('action');

    const scores = await queryScoreboard(objective);
    // const filteredScores = scores.filter((score) => score[1] !== 0);

    const choice = choices.find((x) => x.value === action);

    const prettyfiedObjective = objective.replace(action, `${choice.name} `);

    const buffer = scoreboardToImage(prettyfiedObjective, scores);

    await interaction.editReply({ files: [{ attachment: buffer }] });
  },
};
