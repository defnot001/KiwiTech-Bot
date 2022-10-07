import util from 'minecraft-server-util';

export default async function runRconCommand(
  host,
  rconPort,
  rconPassword,
  command
) {
  try {
    const options = { timeout: 1000 * 5 };
    const rcon = new util.RCON();

    await rcon.connect(host, rconPort, options);
    await rcon.login(rconPassword, options);

    const data = await rcon.execute(command);

    await rcon.close();
    return data;
  } catch (err) {
    return err;
  }
}
