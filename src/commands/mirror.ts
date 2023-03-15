import { ApplicationCommandOptionType } from 'discord.js';
import { Command } from 'djs-handlers';
import type { TDimension } from '../types/minecraft';
import {
  getServerState,
  mirrorRegionFiles,
  parseMinecraftRegions,
  startServerAndWait,
  stopServerAndWait,
} from '../util/pterodactyl';
import { getPlayerCount } from '../util/rcon';

export default new Command({
  name: 'mirror',
  description: 'Copy region files from one server to another.',
  options: [
    {
      name: 'server',
      description:
        'Choose wether you want to mirror SMP to Copy or CMP to CMP2.',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'survival',
          value: 'survival',
        },
        {
          name: 'creative',
          value: 'creative',
        },
      ],
      required: true,
    },
    {
      name: 'dimension',
      description: 'The dimension to mirror.',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: 'overworld',
          value: 'overworld',
        },
        {
          name: 'nether',
          value: 'nether',
        },
        {
          name: 'end',
          value: 'end',
        },
      ],
    },
    {
      name: 'regions',
      description:
        'The regions to mirror. Separate multiple regions with a comma. Example: -1.0, 1.-1',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const server = args.getString('server', true) as 'survival' | 'creative';
    const dimension = args.getString('dimension', true) as TDimension;
    const regionsArg = args.getString('regions', true);

    const sourceServer = server === 'survival' ? 'smp' : 'cmp';
    const targetServer = server === 'survival' ? 'copy' : 'cmp2';

    try {
      const fileNames = parseMinecraftRegions(regionsArg);

      if (!fileNames || fileNames.length === 0) {
        return interaction.editReply('Please provide valid regions to mirror!');
      }

      if (fileNames.length > 12) {
        return interaction.editReply(
          'You can only mirror 12 regions at a time!',
        );
      }

      const serverState = await getServerState(targetServer);

      if (serverState !== 'offline') {
        if ((await getPlayerCount(targetServer)) > 0) {
          return interaction.editReply(
            `There are currently players on ${targetServer}! Please wait until they are all offline before mirroring.`,
          );
        }

        await interaction.editReply('Stopping target server...');

        await stopServerAndWait(targetServer);
      }

      await interaction.editReply(
        `Mirroring ${fileNames.length} region files from ${sourceServer} to ${targetServer}...`,
      );

      const mirrorPromises = fileNames.map((fileName) =>
        mirrorRegionFiles(sourceServer, targetServer, dimension, fileName),
      );

      await Promise.all(mirrorPromises);

      await interaction.editReply(
        'All files copied! Starting target server...',
      );

      await startServerAndWait(targetServer);

      return interaction.editReply(
        `Successfully mirrored ${
          fileNames.length
        } region files and started ${targetServer.toUpperCase()}!`,
      );
    } catch (err) {
      return interaction.editReply(
        `An error occured while mirroring regions from ${sourceServer} to ${targetServer}!`,
      );
    }
  },
});
