import { ApplicationCommandOptionType, AttachmentBuilder, inlineCode, time } from 'discord.js';
import { Command } from 'djs-handlers';
import { createHash } from 'crypto';
import { ptero } from '../util/pterodactyl';
import { config } from '../config';
import { KoalaEmbedBuilder } from '../classes/KoalaEmbedBuilder';
import axios from 'axios';
import { handleInteractionError } from '../util/loggers';
import sharp from 'sharp';

export default new Command({
  name: 'waypoint',
  description: 'Get the coordinates of a waypoint.',
  options: [
    {
      name: 'list',
      description: 'List all SMP Waypoints.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'dimension',
          description: 'The dimension you want the waypoint list from.',
          type: ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: 'Overworld', value: 'overworld' },
            { name: 'Nether', value: 'the_nether' },
            { name: 'End', value: 'the_end' },
            { name: 'All', value: 'all' },
          ],
        },
      ],
    },
    {
      name: 'find',
      description: 'Get a waypoint from SMP.',
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'name',
          description: 'The waypoint you want to get the location of.',
          type: ApplicationCommandOptionType.String,
          required: true,
          autocomplete: true,
        },
      ],
    },
  ],
  execute: async ({ interaction, args }) => {
    await interaction.deferReply();

    const name = args.getString('name');
    const subcommand = args.getSubcommand() as 'list' | 'find';

    if (!interaction.guild) {
      interaction.editReply('Cannot find the guild this interaction was created in.');
      return;
    }

    try {
      if (subcommand === 'find') {
        const waypoints = await getWaypoints();
        const target = waypoints.find((w) => w.name === name);

        if (!target) {
          await interaction.editReply(`Cannot find waypoint: "${name}"`);
          return;
        }

        if (!interaction.guild) {
          await interaction.editReply('Cannot find the guild this command interaction was created in.');
          return;
        }

        const locations = target.dimensions
          .map((d) => {
            const dimensionLookup = {
              'minecraft:overworld': 'Overworld',
              'minecraft:the_nether': 'The Nether',
              'minecraft:the_end': 'The End',
            };

            const dim = dimensionLookup[d as keyof typeof dimensionLookup];

            if (dim === 'The Nether') {
              return `${dim}: ${inlineCode(
                `${Math.floor(target.pos[0] / 8)} ${Math.floor(target.pos[1] / 8)} ${Math.floor(target.pos[2] / 8)}`,
              )}`;
            }

            return `${dim}: ${inlineCode(`${target.pos[0]} ${target.pos[1]} ${target.pos[2]}`)}`;
          })
          .join('\n');

        const embed = new KoalaEmbedBuilder(interaction.user, {
          title: `${interaction.guild.name} SMP Waypoint`,
          fields: [
            { name: 'Name', value: target.name },
            { name: 'Coordinates', value: locations },
            { name: 'Author', value: target.authorName },
            {
              name: 'Created at',
              value: `${time(new Date(target.creationTime), 'D')}\n(${time(new Date(target.creationTime), 'R')})`,
            },
          ],
        });

        if (target.icon) {
          const icon = await getImageFile(target.icon);
          const resized = await scaleImage(icon, 64, 64);
          const attachment = new AttachmentBuilder(resized, { name: 'icon.png' });

          embed.setThumbnail('attachment://icon.png');

          await interaction.editReply({ embeds: [embed], files: [attachment] });
          return;
        }

        const guildIcon = interaction.guild.iconURL();

        if (guildIcon) {
          embed.setThumbnail(guildIcon);
        }

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      if (subcommand === 'list') {
        const dimension = args.getString('dimension', true) as Dimension | 'all';
        const waypoints = await getWaypoints();

        const dimLookup = {
          overworld: 'Overworld',
          the_nether: 'The Nether',
          the_end: 'The End',
        };

        if (dimension === 'all') {
          const allDimensions = ['overworld', 'the_nether', 'the_end'] as const;

          const embeds: KoalaEmbedBuilder[] = [];

          for (const dim of allDimensions) {
            const list = getWaypointNamesByDimension(waypoints, dim);

            const embed = new KoalaEmbedBuilder(interaction.user, {
              title: `${interaction.guild.name} Waypoints ${dimLookup[dim]}`,
              description: list.join('\n'),
            });

            embeds.push(embed);
          }

          await interaction.editReply({ embeds });
          return;
        }

        const list = await getWaypointNamesByDimension(waypoints, dimension);

        const embed = new KoalaEmbedBuilder(interaction.user, {
          title: `${interaction.guild.name} Waypoints ${dimLookup[dimension]}`,
          description: list.join('\n'),
        });

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (err) {
      handleInteractionError({ interaction, err, message: `Something went wrong trying to get the waypoint ${name}` });
    }
  },
});

type Dimension = 'overworld' | 'the_nether' | 'the_end';

function getWaypointNamesByDimension(waypoints: Waypoint[], dimension: Dimension) {
  return waypoints.filter((w) => w.dimensions.includes(`minecraft:${dimension}`)).map((w) => w.name);
}

export async function getWaypoints() {
  const fileContent = (await ptero.files.getContent(
    config.mcConfig.smp.serverId,
    'world/minimapsync.json',
  )) as WaypointFile;

  const waypoints = fileContent.waypoints.waypoints;

  return waypoints.filter((w) => !w.isPrivate);
}

type WaypointFile = {
  formatVersion: number;
  waypoints: {
    waypoints: Waypoint[];
  };
  teleportRule: string;
  icons: string[];
};

type Waypoint = {
  name: string;
  color: number;
  dimensions: string[];
  pos: [number, number, number];
  author: string;
  authorName: string;
  icon?: string;
  creationTime: number;
  isPrivate?: boolean;
};

async function getImageFile(iconName: string) {
  const buffer = new Uint8Array(iconName.length * 2);

  for (let i = 0; i < iconName.length; i++) {
    const char = iconName.charCodeAt(i);

    buffer[i * 2] = char & 0xff;
    buffer[i * 2 + 1] = char >> 8;
  }

  const hash = createHash('sha1').update(buffer).digest('hex');

  const illegalChars = ['/', '.', '\n', '\r', '\t', '\u0000', '\f', '`', '?', '*', '\\', '<', '>', '|', '"', ':'];

  for (const illegalChar of illegalChars) {
    iconName = iconName.replace(illegalChar, '_');
  }

  const imageLink = await ptero.files.getDownloadLink(
    config.mcConfig.smp.serverId,
    `/world/minimapsync_icons/${iconName}_${hash}.png`,
  );

  const { data } = await axios.get<Buffer>(imageLink, { responseType: 'arraybuffer' });

  return data;
}

async function scaleImage(img: Buffer, newWidth: number, newHeight: number) {
  const outputBuffer = await sharp(img)
    .resize({
      width: newWidth,
      height: newHeight,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.nearest,
    })
    .toBuffer();

  return outputBuffer;
}
