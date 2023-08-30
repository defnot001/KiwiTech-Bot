import { ActivityType } from 'discord.js';
import { Event } from 'djs-handlers';
// import { client } from '../index';
// import { config } from '../config';

export default new Event('ready', async (c) => {
  c.user.setActivity('Commands', { type: ActivityType.Listening });
  console.log(`Bot is ready! Logged in as ${c.user.username}.`);
  // await client.removeCommands(config.bot.guildID);
});
