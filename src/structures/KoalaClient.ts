import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
  GatewayIntentBits,
  Partials,
} from 'discord.js';
import glob from 'glob';
import { promisify } from 'util';
import { config } from '../config/config';
import type {
  IRegisterCommandOptions,
  TCommand,
} from '../typings/types/Command';
import projectPaths from '../util/node/projectPaths';
import type { Event } from './Event';

const globPromise = promisify(glob);

export class KoalaClient extends Client {
  commands: Collection<string, TCommand> = new Collection();

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
      ],
      partials: [Partials.GuildMember],
    });
  }

  start() {
    this.registerModules();
    this.login(config.bot.token);
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  async registerCommands({ commands, guildID }: IRegisterCommandOptions) {
    if (guildID) {
      const registerGuild = this.guilds.cache.get(guildID);

      if (!registerGuild) {
        throw new Error('Cannot find the guild to register the commands to!');
      }

      registerGuild.commands.set(commands);

      console.log(`Registering commands to ${registerGuild.name}...`);
    } else {
      if (!this.application) {
        throw new Error(
          'Cannot find the application to register the commands to!',
        );
      }

      this.application.commands.set(commands);

      console.log('Registering global commands');
    }
  }

  async registerModules() {
    // commands
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandPaths: string[] = await globPromise(
      `${projectPaths.commands}/*{.ts,.js}`,
    );

    for await (const path of commandPaths) {
      const command: TCommand = await this.importFile(path);
      if (!command.name) return;

      this.commands.set(command.name, command);
      slashCommands.push(command);
    }

    this.on('ready', () => {
      this.registerCommands({
        guildID: config.bot.guildID,
        commands: slashCommands,
      });
    });
    // events

    const eventPaths: string[] = await globPromise(
      `${projectPaths.events}/*{.ts,.js}`,
    );

    for await (const path of eventPaths) {
      const event: Event<keyof ClientEvents> = await this.importFile(path);
      this.on(event.event, event.execute);
    }
  }
}
