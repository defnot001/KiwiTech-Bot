import runRconCommand from './rconCommand.js';

export default async function queryMSPT(host, rconPort, rconPassword) {
  const data = await runRconCommand(
    host,
    rconPort,
    rconPassword,
    `script run reduce(system_info('server_last_tick_times'), _a+_, 0)/100`
  );

  const mspt = (Math.round(parseFloat(data.split(' ')[2]) * 100) / 100).toFixed(
    2
  );
  let tps;

  if (mspt <= 50) {
    tps = '20.0';
  } else {
    tps = 1000 / mspt;
  }

  return { mspt, tps };
}
