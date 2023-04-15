/* eslint-disable @typescript-eslint/no-non-null-assertion */
import axios from 'axios';
import { PteroClient } from 'ptero-client';
import { config, ServerChoice } from '../config';
import type { TMinecraftRegion } from '../types/minecraft';

type Dimension = 'overworld' | 'nether' | 'end';

export const ptero = new PteroClient({
  baseURL: config.ptero.url,
  apiKey: config.ptero.apiKey,
});

export async function getModFiles(serverChoice: ServerChoice) {
  const modFiles = await (
    await ptero.files.list(config.mcConfig[serverChoice].serverId, '/mods')
  ).filter((mod) => {
    return mod.is_file;
  });

  return modFiles;
}

async function getMods(serverChoice: ServerChoice) {
  const modFiles = await getModFiles(serverChoice);

  return {
    enabled: modFiles.filter((mod) => {
      return mod.name.endsWith('.jar');
    }),
    disabled: modFiles.filter((mod) => {
      return mod.name.endsWith('.disabled');
    }),
  };
}

export async function getModNames(serverChoice: ServerChoice) {
  const mods = await getMods(serverChoice);

  return {
    enabled: mods.enabled.map((mod) => mod.name.replace('.jar', '')),
    disabled: mods.disabled.map((mod) => mod.name.replace('.disabled', '')),
  };
}

export async function getServerState(serverChoice: ServerChoice) {
  const serverStats = await ptero.servers.getResourceUsage(config.mcConfig[serverChoice].serverId);

  return serverStats.current_state;
}

export async function mirrorRegionFiles(
  server: ServerChoice,
  targetServer: ServerChoice,
  dimension: Dimension,
  regionName: string,
) {
  const dimensionPath = {
    overworld: '',
    nether: 'DIM-1/',
    end: 'DIM1/',
  }[dimension];

  const fileTypes = ['region', 'entities', 'poi'] as const;
  const filePaths = fileTypes.map((type) => `world/${dimensionPath}${type}/${regionName}`);

  const linkPromises = filePaths.map((path) => ptero.files.getDownloadLink(config.mcConfig[server].serverId, path));

  const links = await Promise.all(linkPromises);
  links.forEach((link) => {
    if (!link) {
      throw new Error(`Couldn't get the download links for ${dimension} region: ${regionName}`);
    }
  });

  const fileFetchAndWritePromises = links.map(async (link, index) => {
    const file = await axios.get<Buffer>(link, { responseType: 'arraybuffer' });

    const path = filePaths[index];

    if (!path) {
      throw new Error(`Couldn't get the path for ${dimension} region: ${regionName}`);
    }

    await ptero.files.write(config.mcConfig[targetServer].serverId, path, file.data);
  });

  await Promise.all(fileFetchAndWritePromises);
}

export function parseMinecraftRegions(input: string) {
  const regions = input.split(',').map((s) => s.trim());
  const parsedRegions: TMinecraftRegion[] = [];

  for (const region of regions) {
    const parts = region.split('.');

    if (parts.length !== 2) {
      return null;
    }

    const [xStr, zStr] = parts;
    const x = parseInt(xStr!, 10);
    const z = parseInt(zStr!, 10);

    if (isNaN(x) || isNaN(z)) {
      return null;
    }

    parsedRegions.push({ x, z });
  }

  return parsedRegions.map((region) => `r.${region.x}.${region.z}.mca`);
}

export async function stopServerAndWait(serverChoice: ServerChoice) {
  await ptero.servers.stop(config.mcConfig[serverChoice].serverId);

  let serverState = await getServerState(serverChoice);
  let counter = 0;

  while (serverState !== 'offline') {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    serverState = await getServerState(serverChoice);
    counter++;

    if (counter > 15) {
      throw new Error('Server failed to stop.');
    }
  }
}

export async function startServerAndWait(serverChoice: ServerChoice) {
  await ptero.servers.start(config.mcConfig[serverChoice].serverId);

  let serverState = await getServerState(serverChoice);
  let counter = 0;

  while (serverState !== 'running') {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    serverState = await getServerState(serverChoice);
    counter++;

    if (counter > 15) {
      throw new Error('Server failed to start.');
    }
  }
}

export async function areRegionsIncluded(regionNames: string[], dimension: Dimension, server: ServerChoice) {
  const dimensionPath = {
    overworld: '',
    nether: 'DIM-1/',
    end: 'DIM1/',
  }[dimension];

  const regionFiles = await ptero.files.list(config.mcConfig[server].serverId, `world/${dimensionPath}region`);

  const regionFileNames = regionFiles.map((file) => file.name);

  return regionNames.every((regionName) => regionFileNames.includes(regionName));
}
