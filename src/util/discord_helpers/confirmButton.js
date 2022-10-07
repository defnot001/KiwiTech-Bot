import { ButtonBuilder, ButtonStyle, ActionRowBuilder, bold } from 'discord.js';

export default function buildConfirmButton(serverChoice, guild, action) {
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

  const row = new ActionRowBuilder({
    components: [confirmButton, cancelButton],
  });

  const reply = {
    content: `Are you sure you want to ${action} ${guild.name} ${bold(
      serverChoice
    )}?`,
    components: [row],
  };

  return reply;
}
