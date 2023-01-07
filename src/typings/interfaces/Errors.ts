import type { Client, Guild } from 'discord.js';
import type IExtendedInteraction from './ExtendedInteraction';

export interface IInteractionErrorOptions {
  interaction: IExtendedInteraction;
  errorMessage: string;
}

export interface IEventErrorOptions {
  client: Client;
  guild: Guild;
  errorMessage: string;
}
