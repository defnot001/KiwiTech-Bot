import type { ApplicationCommandOptionChoiceData } from 'discord.js';
import { config } from '../../config/config';
import type { TPowerActionNoStart } from '../../typings/types/typeHelpers';
import { ptero } from '../pterodactyl';

export function getServerChoices(): ApplicationCommandOptionChoiceData<string>[] {
  const choices = [];

  for (const server of Object.keys(config.mcConfig)) {
    choices.push({ name: server, value: server });
  }

  return choices;
}

export function escapeMarkdown(text: string): string {
  const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, '$1');
  return unescaped.replace(/(\*|_|`|~|\\)/g, '\\$1');
}

export function includesUndefined<T>(array: (T | undefined)[]) {
  return array.includes(undefined);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 ** 2) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 ** 3) {
    return (bytes / 1024 ** 2).toFixed(1) + ' MB';
  } else if (bytes < 1024 ** 4) {
    return (bytes / 1024 ** 3).toFixed(1) + ' GB';
  } else {
    return (bytes / 1024 ** 4).toFixed(1) + ' TB';
  }
}

export default function formatTime(ms: number) {
  const roundTowardsZero = ms > 0 ? Math.floor : Math.ceil;
  const days = roundTowardsZero(ms / 86400000);
  const hours = roundTowardsZero(ms / 3600000) % 24;
  const minutes = roundTowardsZero(ms / 60000) % 60;
  const seconds = roundTowardsZero(ms / 1000) % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getAction(action: TPowerActionNoStart) {
  switch (action) {
    case 'start':
      return 'started';
    case 'stop':
      return 'stopped';
    case 'restart':
      return 'restarted';
    default:
      throw new Error('Invalid action.');
  }
}

export async function performAction(
  action: TPowerActionNoStart,
  serverId: string,
): Promise<boolean> {
  if (action === 'stop') {
    await ptero.servers.stop(serverId);
    return true;
  } else if (action === 'restart') {
    await ptero.servers.restart(serverId);
    return true;
  } else if (action === 'kill') {
    await ptero.servers.kill(serverId);
    return true;
  } else {
    return false;
  }
}
