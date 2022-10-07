import {
  SlashCommandBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  time,
  bold,
} from 'discord.js';
import pteroClient from '../util/pterodactyl/pteroClient.js';
import generateServerChoices from '../util/discord_helpers/serverChoices.js';
import capitalizeFirstLetter from '../util/discord_helpers/capitalizeFirstLetter.js';
import buildDefaultEmbed from '../util/discord_helpers/defaultEmbed.js';
import pteroconfig from '../config/pteroConfig.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('backup')
    .setDescription('Control Backups on a Minecraft Server.')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('Lists all Backups from a Minecraft Server.')
        .addStringOption((option) =>
          option
            .setName('server')
            .setDescription('The Server you want get the Backups from.')
            .setRequired(true)
            .addChoices(...generateServerChoices())
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('create')
        .setDescription('Creates a Backup on a Minecraft Server.')
        .addStringOption((option) =>
          option
            .setName('server')
            .setDescription('The Server you want to create a Backup on.')
            .setRequired(true)
            .addChoices(...generateServerChoices())
        )
    ),
  // eslint-disable-next-line consistent-return
  async execute(interaction) {
    await interaction.deferReply();

    const choice = interaction.options.getString('server');
    const serverChoice = capitalizeFirstLetter(choice);
    const subcommand = interaction.options.getSubcommand();
    const serverid = pteroconfig.severId[choice];

    const backupList = await pteroClient.listServerBackups(serverid);

    if (subcommand === 'list') {
      let backupNames = [];

      for (let i = 0; i < backupList.length; i += 1) {
        const backup = backupList[i];
        const timestamp =
          new Date(backup.attributes.created_at).getTime() / 1000;

        backupNames.push(
          `${i + 1}.
          **Time**: ${time(timestamp, 'F')}
          **Name**: ${backup.attributes.name}\n`
        );
      }

      if (backupNames.length > 25) {
        backupNames = backupNames.slice(-25);
      }

      const backupListEmbed = buildDefaultEmbed(interaction.user)
        .setTitle(
          `Backup list for ${
            interaction.guild.name
          } ${serverChoice.toUpperCase()}`
        )
        .setThumbnail(interaction.guild.iconURL())
        .setDescription(backupNames.join('\n'));

      await interaction.editReply({ embeds: [backupListEmbed] });
    } else if (subcommand === 'create') {
      if (pteroconfig.backupLimit[choice] === 0) {
        return interaction.editReply(
          `You can not create a backup for ${interaction.guild.name} ${bold(
            serverChoice
          )} because this server does not allow backups.`
        );
      }

      if (backupList.length === pteroconfig.backupLimit[choice]) {
        const confirmButton = new ButtonBuilder({
          style: ButtonStyle.Success,
          label: 'Confirm',
          customId: 'confirm',
        });
        const cancelButton = new ButtonBuilder({
          style: ButtonStyle.Danger,
          label: 'Cancel',
          customId: 'cancel',
        });
        const row = new ActionRowBuilder({
          components: [confirmButton, cancelButton],
        });
        const buttons = {
          content: `This command will delete the oldest backup for ${
            interaction.guild.name
          } ${bold(
            serverChoice
          )} because the backup limit is reached for this server. Are you sure you want to continue? This can not be undone!`,
          components: [row],
        };

        interaction.editReply(buttons);

        const filter = (click) => click.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
          max: 1,
          time: 10000,
          filter,
        });

        collector.on('collect', async (i) => {
          if (i.customId === 'confirm') {
            try {
              await pteroClient.deleteBackup(
                serverid,
                backupList[0].attributes.uuid
              );
              await pteroClient.createServerBackup(serverid);

              return interaction.editReply({
                content: `Successfully deleted oldest backup and created a new one for ${
                  interaction.guild.name
                } ${bold(serverChoice)}.`,
                components: [],
              });
            } catch (err) {
              console.error(err);
              return interaction.editReply({
                content: `Failed to delete the oldest backup for ${
                  interaction.guild.name
                } ${bold(serverChoice)}.`,
                components: [],
              });
            }
          } else {
            return i.update({
              content: `Cancelled deleting the oldest backup for ${interaction.guild.name} ${serverChoice}`,
            });
          }
        });
      } else {
        try {
          await pteroClient.createServerBackup(serverid);
          return interaction.editReply({
            content: `Successfully created a backup for ${
              interaction.guild.name
            } ${bold(serverChoice)}.`,
            components: [],
          });
        } catch (err) {
          console.error(err);
          return interaction.editReply(
            `Failed to create backup for ${interaction.guild.name} ${bold(
              serverChoice
            )}. Error Code: ${err}. Check if the server is online or if the maximum amount of backups is reached. Also note that you can only create two backups in a 10 minute time frame.`
          );
        }
      }
    }
  },
};
