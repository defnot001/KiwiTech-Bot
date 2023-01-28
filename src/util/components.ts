import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  TextBasedChannel,
} from 'discord.js';
import type { IExtendedInteraction } from 'djs-handlers';
import { getServerChoices } from './helpers';

const confirmButton = new ButtonBuilder({
  style: ButtonStyle.Success,
  label: 'Confirm',
  customId: 'confirm',
});

const cancelButton = new ButtonBuilder({
  style: ButtonStyle.Danger,
  label: 'Cancel',
  customId: 'cancel',
});

export const confirmCancelRow = new ActionRowBuilder<ButtonBuilder>({
  components: [confirmButton, cancelButton],
});

export const mcServerChoice = {
  name: 'server',
  description: 'The server you want to target.',
  type: 3,
  required: true,
  choices: [...getServerChoices()],
};

export function getButtonCollector(
  interaction: IExtendedInteraction,
  channel: TextBasedChannel,
) {
  return channel.createMessageComponentCollector<ComponentType.Button>({
    filter: (i) => i.user.id === interaction.user.id,
    max: 1,
    time: 10000,
  });
}
