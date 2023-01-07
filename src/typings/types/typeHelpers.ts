import type { config } from '../../config/config';

export type TPowerAction = 'start' | 'stop' | 'restart' | 'kill';
export type TPowerActionNoStart = Omit<TPowerAction, 'start'>;
export type MCServerSubcommand =
  | 'start'
  | 'stop'
  | 'restart'
  | 'kill'
  | 'stats';

export type TServerChoice = keyof typeof config.mcConfig;
export type TConfig = typeof config;
export type TConfigKeys = keyof TConfig;
export type TChannelName = keyof TConfig['channels'];
export type TModerationAction = 'kick' | 'ban' | 'unban';
