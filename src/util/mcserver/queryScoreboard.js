import runRconCommand from './rconCommand.js';
import mcconfig from '../../config/mcConfig.js';

const { host, rconPort, rconPassword } = mcconfig.smp;

export default async function queryScoreboard(scoreboard) {
  const queryCommand = `script run scores = []; for(system_info('server_whitelist'), put(scores, null, l('"' + _ + '"', scoreboard('${scoreboard}', _)) )); print(scores)`;

  const data = await runRconCommand(host, rconPort, rconPassword, queryCommand);

  const scores = data.split(' =')[0].replaceAll('null', 0);
  const parsed = JSON.parse(scores);
  const sorted = parsed.sort((a, b) => b[1] - a[1]);
  const leaderboard = sorted.slice(0, 20);
  return leaderboard;
}
