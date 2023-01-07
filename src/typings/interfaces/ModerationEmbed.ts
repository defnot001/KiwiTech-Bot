import type { GuildMember, User } from 'discord.js';
import type { TModerationAction } from '../types/typeHelpers';

export interface IModerationEmbedOptions {
  target: User;
  executor: GuildMember;
  action: TModerationAction;
  reason?: string | null;
  expiration?: number | null;
}

export interface IModerationDescription {
  member: string;
  action: string;
  reason?: string;
  expiration?: string;
}
