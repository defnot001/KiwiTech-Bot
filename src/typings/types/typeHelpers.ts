import type { preconfig } from '../../config/config';

export type TPowerAction = 'start' | 'stop' | 'restart' | 'kill';
export type TPowerActionNoStart = Omit<TPowerAction, 'start'>;
export type MCServerSubcommand =
  | 'start'
  | 'stop'
  | 'restart'
  | 'kill'
  | 'stats';

export type TServerChoice = keyof typeof preconfig.mcConfig;
export type TConfigKeys = keyof TConfig;
export type TChannelName = keyof TConfig['channels'];
export type TModerationAction = 'kick' | 'ban' | 'unban';
export type TAvatarOptions =
  | '/avatars/'
  | '/renders/head/'
  | '/renders/body/'
  | '/skins/';
export type TMojangUUIDResponse = {
  name: string;
  id: string;
};
export type TConfig = {
  bot: {
    readonly token: string;
    readonly clientID: string;
    readonly guildID: string;
  };
  ptero: {
    readonly url: string;
    readonly apiKey: string;
  };
  channels: {
    readonly memberLog: string;
    readonly modLog: string;
    readonly botLog: string;
    readonly invite: string;
    readonly resources: string;
    readonly serverInfo: string;
    readonly todo: string;
  };
  roles: {
    readonly members: string;
    readonly admins: string;
  };
  embedColors: {
    readonly default: number;
    readonly none: number;
    readonly red: number;
    readonly orange: number;
    readonly yellow: number;
    readonly green: number;
  };
  emoji: {
    readonly kiwi: string;
    readonly owoKiwi: string;
    readonly froghypers: string;
  };
  mcConfig: {
    readonly smp: TMCServerConfig;
    readonly cmp: TMCServerConfig;
    readonly cmp2: TMCServerConfig;
    readonly copy: TMCServerConfig;
    readonly snapshots: TMCServerConfig;
  };
};

export type TMCServerConfig = {
  readonly host: string;
  readonly port: number;
  readonly serverId: string;
  readonly rconPort: number;
  readonly rconPasswd: string;
  readonly operator: boolean;
  readonly backupLimit: number;
};
