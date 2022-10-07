import util from 'minecraft-server-util';

export default async function getServerStatus(host, port) {
  const response = await util.queryFull(host, port, { enableSRV: true });
  return response;
}
