import runRconCommand from './rconCommand.js';

export default async function queryMobcap(host, rconPort, rconPassword) {
  const dimensions = ['overworld', 'the_nether', 'the_end'];
  const mobcap = {};

  for (const dim of dimensions) {
    const query = `execute in minecraft:${dim} run script run get_mob_counts('monster')`;
    const data = await runRconCommand(host, rconPort, rconPassword, query);
    mobcap[dim] = data
      .replace(/^.{0,3}| \(.*\)|[[\]]/g, '')
      .replace(/, /g, ' | ');
  }
  return mobcap;
}
