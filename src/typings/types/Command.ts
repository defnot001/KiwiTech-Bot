import type {
  ApplicationCommandDataResolvable,
  ChatInputApplicationCommandData,
  CommandInteractionOptionResolver,
  PermissionResolvable,
} from 'discord.js';
import type { KoalaClient } from '../../structures/KoalaClient';
import type ExtendedInteraction from '../interfaces/ExtendedInteraction';
interface ClientRunOptionsInterface {
  client: KoalaClient;
  interaction: ExtendedInteraction;
  args: CommandInteractionOptionResolver;
}

type ExecuteFunctions = (options: ClientRunOptionsInterface) => unknown;

export type TCommand = {
  userPermissions?: PermissionResolvable;
  execute: ExecuteFunctions;
} & ChatInputApplicationCommandData;

export interface IRegisterCommandOptions {
  guildID: string;
  commands: ApplicationCommandDataResolvable[];
}
