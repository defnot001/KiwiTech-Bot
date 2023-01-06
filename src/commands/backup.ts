import {
  ApplicationCommandOptionType,
  bold,
  inlineCode,
  time,
} from 'discord.js';
import { config } from '../config/config';
import { Command } from '../structures/Command';
import { KoalaEmbedBuilder } from '../structures/embeds/KoalaEmbedBuilder';
import type { TServerChoice } from '../typings/types/typeHelpers';
import {
  confirmCancelRow,
  getButtonCollector,
} from '../util/components/components';
import getErrorMessage from '../util/functions/errors';
import { formatBytes, getServerChoices } from '../util/functions/helpers';
import { errorLog } from '../util/functions/loggers';
import { ptero } from '../util/pterodactyl';

export default new Command({
  name: 'backup',
  description: 'Control backups on a minecraft server.',
  options: [
    {
      name: 'list',
      description: 'Lists all backups from a minecraft server.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'server',
          description: 'The server you want to get the backups from.',
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [...getServerChoices()],
        },
      ],
    },
    {
      name: 'create',
      description: 'Creates a backup on a minecraft server.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'server',
          description: 'The server you want to create a backup on.',
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [...getServerChoices()],
        },
        {
          name: 'name',
          description: 'The name of the backup.',
          type: ApplicationCommandOptionType.String,
          required: false,
        },
        {
          name: 'locked',
          description: 'Whether or not the backup is locked.',
          type: ApplicationCommandOptionType.Boolean,
          required: false,
        },
      ],
    },
    {
      name: 'details',
      description: 'Get details about a backup.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'server',
          description: 'The server you want to get the backups from.',
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [...getServerChoices()],
        },
        {
          name: 'backupid',
          description: 'The uuid of the backup you want details from.',
          type: ApplicationCommandOptionType.String,
          required: true,
        },
      ],
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const subcommand = args.getSubcommand();
    const choice = args.getString('server');
    const guild = interaction.guild;

    if (!guild) {
      return interaction.editReply(
        'This command can only be used in a server.',
      );
    }

    if (!choice) {
      return interaction.editReply('Please choose a server.');
    }

    const serverChoice = choice as TServerChoice;
    const { serverId } = config.mcConfig[serverChoice];

    if (subcommand === 'list') {
      try {
        const { data } = await ptero.backups.list(serverId);

        const transformedList = data.slice(-20).map((backup) => {
          const { name, uuid, created_at } = backup;
          return `${time(created_at, 'f')}\n${bold(name)}\n${inlineCode(uuid)}`;
        });

        const backupListEmbed = new KoalaEmbedBuilder(interaction.user, {
          description: transformedList.join('\n\n'),
        });

        return interaction.editReply({ embeds: [backupListEmbed] });
      } catch (err) {
        getErrorMessage(err);
        return errorLog({
          interaction: interaction,
          errorMessage: `Failed to list backups for ${serverChoice}!`,
        });
      }
    } else if (subcommand === 'create') {
      if (config.mcConfig[serverChoice].backupLimit === 0) {
        return interaction.editReply(
          `You can not create a backup for ${interaction.guild.name} ${bold(
            serverChoice,
          )} because this server does not allow backups.`,
        );
      }

      const backupName =
        args.getString('name') ?? `Backup created by KoalaBot at ${new Date()}`;

      const locked = args.getBoolean('locked') ?? false;

      try {
        const backupData = await ptero.backups.list(serverId);

        if (
          backupData.meta.pagination.total <
          config.mcConfig[serverChoice].backupLimit
        ) {
          const backup = await ptero.backups.create(serverId, {
            backupName,
            locked,
          });

          return interaction.editReply(
            `Successfully created backup (${inlineCode(backup.name)}) for ${
              interaction.guild.name
            } ${bold(serverChoice)}!`,
          );
        } else {
          await interaction.editReply({
            content: `This command will delete the oldest backup for ${
              interaction.guild.name
            } ${bold(
              serverChoice,
            )} because the backup limit is reached for this server. Are you sure you want to continue? This can not be undone!`,
            components: [confirmCancelRow],
          });

          if (!interaction.channel) {
            return interaction.editReply(
              'This command can only be used in a text channel.',
            );
          }

          const collector = getButtonCollector(
            interaction,
            interaction.channel,
          );

          collector.on('collect', async (i) => {
            if (i.customId === 'confirm') {
              // we can assert non null here because we verified earlier that we have exceeded the maximum amount of backups.
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              await ptero.backups.delete(serverId, backupData.data[0]!.uuid);
              const backup = await ptero.backups.create(serverId, {
                backupName,
                locked,
              });

              interaction.editReply({
                content: `Successfully deleted oldest backup and created backup (${inlineCode(
                  backup.name,
                )}) for ${guild.name} ${bold(serverChoice)}!`,
                components: [],
              });
            } else {
              interaction.editReply({
                content: `Cancelled deleting the oldest backup for ${
                  guild.name
                } ${bold(serverChoice)}!`,
                components: [],
              });
            }
          });
        }
      } catch (err) {
        getErrorMessage(err);
        return errorLog({
          interaction: interaction,
          errorMessage: `Failed to create a backup for ${serverChoice}!`,
        });
      }
    } else if (subcommand === 'details') {
      const backupId = args.getString('backupid');

      if (!backupId) {
        return interaction.editReply('Please provide a backup uuid!');
      }

      try {
        const backupDetails = await ptero.backups.getDetails(
          serverId,
          backupId,
        );

        const completedTime = backupDetails.completed_at
          ? time(backupDetails.completed_at, 'f')
          : 'Backup not completed.';

        const backupEmbed = new KoalaEmbedBuilder(interaction.user, {
          title: `Backup Details for ${guild.name} ${serverChoice}`,
          fields: [
            { name: 'Name', value: backupDetails.name },
            {
              name: 'UUID',
              value: `${inlineCode(backupDetails.uuid)}`,
            },
            {
              name: 'Size',
              value: formatBytes(backupDetails.bytes),
              inline: true,
            },
            {
              name: 'Successful',
              value: backupDetails.is_successful ? 'true' : 'false',
              inline: true,
            },
            {
              name: 'Locked',
              value: backupDetails.is_locked ? 'true' : 'false',
              inline: true,
            },
            {
              name: 'Created at',
              value: time(backupDetails.created_at, 'f'),
              inline: true,
            },
            {
              name: 'Completed at',
              value: completedTime,
              inline: true,
            },
          ],
        });

        // we have to check if the guild has an icon because there is no method that provides a default icon.
        if (guild.iconURL()) {
          backupEmbed.setThumbnail(guild.iconURL());
        }

        return interaction.editReply({ embeds: [backupEmbed] });
      } catch (err) {
        getErrorMessage(err);
        return errorLog({
          interaction: interaction,
          errorMessage: `Failed to get the backup details for ${serverChoice}!`,
        });
      }
    }
  },
});
