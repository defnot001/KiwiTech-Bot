import { GatewayIntentBits, Partials } from 'discord.js';
import { ExtendedClient } from 'djs-handlers';
import express from 'express';
import { config, projectPaths } from './config';
import {
  ApplicationBody,
  ApplicationPostHeaders,
  parseApplication,
  postApplicationToChannel,
} from './util/application';
import bodyParser from 'body-parser';
// import { ApplicationBody } from './util/application';

export const client = new ExtendedClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  partials: [Partials.GuildMember],
});

client.start({
  botToken: config.bot.token,
  guildID: config.bot.guildID,
  commandsPath: projectPaths.commands,
  eventsPath: projectPaths.events,
  type: 'commonJS',
  globalCommands: false,
  registerCommands: true,
});

const app = express();
const PORT = 3000 as const;
app.use(bodyParser.json());

app.post('/form-submission', async (req, res) => {
  const headers = req.headers as ApplicationPostHeaders;
  const id = headers['user-agent'].split('; ')[4]?.replace('id: ', '');

  if (id !== config.application.id) {
    return res.status(403).send('Forbidden');
  }

  const applicationObject = parseApplication(req.body as ApplicationBody);
  await postApplicationToChannel(applicationObject);

  return res.status(200).send('Received');
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT} for applications...`);
});
