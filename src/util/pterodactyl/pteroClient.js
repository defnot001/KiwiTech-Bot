import Nodeactyl from 'nodeactyl';
import pteroconfig from '../../config/pteroConfig.js';

const pteroClient = new Nodeactyl.NodeactylClient(
  pteroconfig.url,
  pteroconfig.apikey
);

export default pteroClient;
