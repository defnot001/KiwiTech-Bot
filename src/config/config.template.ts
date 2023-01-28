// import dotenv from 'dotenv';
// import path from 'path';
// import { env } from 'process';
// import type { TConfig } from '../types/discord';

// dotenv.config();

// export const projectPaths = {
//   sources: path.join(path.dirname(__dirname)),
//   commands: path.join(path.dirname(__dirname), 'commands'),
//   events: path.join(path.dirname(__dirname), 'events'),
// };

// export const preconfig = {
//   bot: {
//     token: env['BOT_TOKEN'],
//     clientID: env['CLIENT_ID'],
//     guildID: env['GUILD_ID'],
//   },
//   ptero: {
//     url: env['URL'],
//     apiKey: env['API_KEY'],
//   },
//   channels: {
//     memberLog: '',
//     modLog: '',
//     botLog: '',
//     invite: '',
//     resources: '',
//     serverInfo: '',
//     todo: '',
//   },
//   roles: {
//     members: '',
//     admins: '',
//   },
//   embedColors: {
//     default: 3_517_048,
//     none: 3_092_790,
//     red: 13_382_451,
//     orange: 16_737_843,
//     yellow: 16_769_536,
//     green: 6_736_998,
//   },
//   emoji: {
//     kiwi: '',
//     owoKiwi: '',
//     froghypers: '',
//     frogYes: '',
//     frogNo: '',
//   },
//   mcConfig: {
//     smp: {
//       host: 'panel.example.com',
//       port: 25565,
//       serverId: '',
//       rconPort: 25566,
//       rconPasswd: env['SMP_RCON_PASSWORD'],
//       operator: false,
//       backupLimit: 20,
//     },
//     cmp: {
//       host: 'panel.example.com',
//       port: 25575,
//       serverId: '',
//       rconPort: 25576,
//       rconPasswd: env['CMP_RCON_PASSWORD'],
//       operator: true,
//       backupLimit: 10,
//     },
//     cmp2: {
//       host: 'panel.example.com',
//       port: 25585,
//       serverId: '',
//       rconPort: 25586,
//       rconPasswd: env['CMP2_RCON_PASSWORD'],
//       operator: true,
//       backupLimit: 0,
//     },
//     copy: {
//       host: 'panel.example.com',
//       port: 25595,
//       serverId: '',
//       rconPort: 25596,
//       rconPasswd: env['COPY_RCON_PASSWORD'],
//       operator: true,
//       backupLimit: 5,
//     },
//     snapshots: {
//       host: 'panel.example.com',
//       port: 25605,
//       serverId: '',
//       rconPort: 25606,
//       rconPasswd: env['SNAPSHOTS_RCON_PASSWORD'],
//       operator: true,
//       backupLimit: 0,
//     },
//   },
// };

// function hasAllProperties<T>(obj: T): T {
//   for (const key in obj) {
//     if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
//       throw new Error(`Object is missing property: ${key}`);
//     }
//     if (typeof obj[key] === 'object') {
//       hasAllProperties(obj[key]);
//     }
//   }
//   return obj;
// }

// export const config = hasAllProperties(preconfig) as TConfig;
